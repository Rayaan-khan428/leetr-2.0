import { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/middleware/auth'
import { prisma } from '../../../../prisma/client'
import { OpenAI } from 'openai'
import { v4 as uuidv4 } from 'uuid'

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    // Get the auth token from the request header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const decodedToken = await verifyAuthToken(token);
    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return new Response('No file provided', { status: 400 })
    }

    const text = await file.text()

    // Use OpenAI to parse the CSV and convert to structured data
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that parses CSV data about LeetCode problems into structured JSON. 
          
Today's date is ${new Date().toISOString().split('T')[0]}.
Current month is ${new Date().getMonth() + 1}.
Current year is ${new Date().getFullYear()}.

The output should be an array of objects with the properties: 
- problemName (required)
- difficulty (must be one of: EASY, MEDIUM, HARD in uppercase)
- timeComplexity (optional)
- spaceComplexity (optional)
- notes (optional)
- solvedAt (optional, in ISO format)

For date handling:

1. If solvedAt is provided in MM-DD-YYYY format, validate that it's not in the future:
   - If the date is in the future, use today's date instead
   - Otherwise, use the provided date

2. If the year is missing (MM-DD format):
   - If the month is in the future compared to the current month, use last year (${new Date().getFullYear() - 1})
   - If the month has already occurred this year, use the current year (${new Date().getFullYear()})

3. For any complete date (with year) that is in the future:
   - If only the day is in the future (same month and year as today), use the last day of the previous month
   - If the month or year is in the future, use the current date

4. If solvedAt is not provided, don't include it in the output.

No need to generate a leetcodeId field.

IMPORTANT: Return ONLY the raw JSON array with no markdown formatting, code blocks, or explanations.`
        },
        {
          role: "user",
          content: `Parse this CSV data into structured JSON: ${text}`
        }
      ],
      store: true
    })

    // Extract JSON from the response, handling potential markdown formatting
    let jsonData = completion.choices[0].message.content || '';

    // Remove markdown code blocks if present
    jsonData = jsonData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the cleaned JSON
    const parsedData = JSON.parse(jsonData);

    // Validate dates to ensure no future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison

    const validatedData = parsedData.map((problem: any) => {
      if (problem.solvedAt) {
        const solvedDate = new Date(problem.solvedAt);
        
        // If date is in the future, set to today
        if (solvedDate > today) {
          console.log(`Correcting future date for problem "${problem.problemName}": ${problem.solvedAt} -> ${today.toISOString()}`);
          problem.solvedAt = today.toISOString();
        }
      }
      return problem;
    });

    // Insert the problems into the database, skipping duplicates
    const results = await Promise.all(
      validatedData.map(async (problem: any) => {
        try {
          // Generate a simple ID based on the problem name
          const simplifiedId = problem.problemName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric chars with hyphens
            .replace(/-+/g, '-')        // Replace multiple hyphens with a single one
            .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens
          
          const createdProblem = await prisma.user_problems.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              leetcodeId: simplifiedId, // Use simplified problem name as ID
              problemName: problem.problemName,
              difficulty: problem.difficulty,
              timeComplexity: problem.timeComplexity,
              spaceComplexity: problem.spaceComplexity,
              notes: problem.notes,
              solvedAt: new Date(problem.solvedAt || Date.now()),
              mainCategory: "ARRAY_STRING",
            }
          });
          return { success: true, problem: createdProblem };
        } catch (error: any) {
          // Skip duplicates but track them
          if (error.code === 'P2002') {
            return { success: false, skipped: true, problemName: problem.problemName };
          }
          // Other errors are real errors
          return { success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const skipped = results.filter(r => !r.success && r.skipped).length;
    const failed = results.filter(r => !r.success && !r.skipped).length;

    return new Response(JSON.stringify({ 
      count: successful,
      skipped,
      failed
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Import error:', error)
    return new Response('Import failed', { status: 500 })
  }
} 