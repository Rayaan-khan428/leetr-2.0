import { prisma } from '../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { calculateNextReview } from '@/lib/utils/spaced-repetition'
import { notifyFriendsOfCompletion } from '@/lib/utils/notifications'
import { NextRequest } from 'next/server'

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

    const data = await req.json();
    
    // Validate required fields
    if (!data.leetcodeId || !data.problemName || !data.difficulty) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: leetcodeId, problemName, and difficulty are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create the problem with only the fields we need
    const problem = await prisma.user_problems.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        leetcodeId: data.leetcodeId,
        problemName: data.problemName,
        difficulty: data.difficulty,
        timeComplexity: data.timeComplexity || null,
        spaceComplexity: data.spaceComplexity || null,
        notes: data.notes || null,
        solvedAt: data.solvedAt ? new Date(data.solvedAt) : new Date(),
        mainCategory: "ARRAY_STRING",
      }
    });

    return new Response(JSON.stringify(problem), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (dbError: any) {
    // Check if it's a unique constraint violation
    if (dbError.code === 'P2002') {
      return new Response(JSON.stringify({ 
        error: 'You have already added this LeetCode problem' 
      }), { 
        status: 409, // Conflict status code
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Re-throw other errors to be caught by the outer catch block
    throw dbError;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Authentication failed: No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await verifyAuthToken(token);
      const user = await prisma.users.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user) {
        console.log('User not found for firebase UID:', decodedToken.uid);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const problems = await prisma.user_problems.findMany({
        where: { userId: user.id },
        orderBy: { solvedAt: 'desc' }
      });

      return NextResponse.json(problems);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/problems:', error);
    return NextResponse.json(
      {
        error: 'Error fetching problems',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}