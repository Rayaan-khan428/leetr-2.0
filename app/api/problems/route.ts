import { prisma } from '../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { calculateNextReview } from '@/lib/utils/spaced-repetition'

export async function POST(request: Request) {
  try {
    console.log('=== Starting POST request handling ===');
    
    // Log the incoming request
    const reqClone = request.clone();
    const bodyText = await reqClone.text();
    console.log('Raw request body:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('Parsed request body:', body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Auth header missing or invalid');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token extracted, verifying...');

    try {
      const decodedToken = await verifyAuthToken(token);
      console.log('Token verified, uid:', decodedToken.uid);
      
      const user = await prisma.users.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });
      console.log('User lookup result:', !!user);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const {
        leetcodeId,
        problemName,
        difficulty,
        solution,
        notes,
        timeComplexity,
        spaceComplexity,
        url
      } = body;

      console.log('Extracted data:', {
        leetcodeId,
        problemName,
        difficulty,
        timeComplexity,
        spaceComplexity,
        url
      });

      if (!leetcodeId || !problemName || !difficulty) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return NextResponse.json(
          { error: 'Invalid difficulty level' },
          { status: 400 }
        );
      }

      // Check for existing problem
      const existingProblem = await prisma.user_problems.findUnique({
        where: {
          userId_leetcodeId: {
            userId: user.id,
            leetcodeId
          }
        }
      });

      if (existingProblem) {
        const updatedProblem = await prisma.user_problems.update({
          where: { id: existingProblem.id },
          data: {
            attempts: { increment: 1 },
            solution,
            notes,
            timeComplexity,
            spaceComplexity,
            updatedAt: new Date(),
            solvedAt: new Date(),
            nextReview: calculateNextReview(existingProblem.attempts + 1, new Date())
          }
        });
        console.log('Updated existing problem:', updatedProblem.id);
        return NextResponse.json(updatedProblem);
      }

      const newProblem = await prisma.user_problems.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          leetcodeId,
          problemName,
          difficulty,
          solution,
          notes,
          timeComplexity,
          spaceComplexity,
          url,
          updatedAt: new Date(),
          solvedAt: new Date(),
          nextReview: calculateNextReview(1, new Date())
        }
      });
      
      console.log('Created new problem:', newProblem.id);
      return NextResponse.json(newProblem, { status: 201 });

    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid token', details: tokenError.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Error creating problem',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
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