import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('=== Starting GET /api/problems/search request ===');

    // Get the leetcodeId from query parameters
    const { searchParams } = new URL(request.url);
    const leetcodeId = searchParams.get('leetcodeId');
    console.log('Searching for leetcodeId:', leetcodeId);

    if (!leetcodeId) {
      console.log('No leetcodeId provided');
      return NextResponse.json(
        { error: 'leetcodeId is required' },
        { status: 400 }
      );
    }

    // Verify auth token
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
      
      // Get user from database
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

      // Search for the problem
      const problem = await prisma.user_problems.findUnique({
        where: {
          userId_leetcodeId: {
            userId: user.id,
            leetcodeId: leetcodeId
          }
        },
        select: {
          id: true,
          leetcodeId: true,
          problemName: true,
          difficulty: true,
          solution: true,
          notes: true,
          solvedAt: true,
          attempts: true,
          timeComplexity: true,
          spaceComplexity: true,
          difficultyRating: true
        }
      });
      console.log('Problem found:', !!problem);

      if (!problem) {
        return NextResponse.json(
          { error: 'Problem not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(problem);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/problems/search:', error);
    return NextResponse.json(
      {
        error: 'Error searching for problem',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 