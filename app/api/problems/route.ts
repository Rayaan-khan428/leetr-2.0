import { prisma } from '../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { calculateNextReview } from '@/lib/utils/spaced-repetition'
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyAuthToken(token)
    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
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
    } = await request.json()

    if (!leetcodeId || !problemName || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      )
    }

    // Check for existing problem
    const existingProblem = await prisma.user_problems.findUnique({
      where: {
        userId_leetcodeId: {
          userId: user.id,
          leetcodeId
        }
      }
    })

    if (existingProblem) {
      return NextResponse.json(
        await prisma.user_problems.update({
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
        })
      )
    }

    const problem = await prisma.user_problems.create({
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
    })

    return NextResponse.json(problem, { status: 201 })
  } catch (error) {
    console.error('Error creating problem:', error)
    return NextResponse.json(
      {
        error: 'Error creating problem',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Authentication failed: No token provided')
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    try {
      const decodedToken = await verifyAuthToken(token)
      const user = await prisma.users.findUnique({
        where: { firebaseUid: decodedToken.uid }
      })

      if (!user) {
        console.log('User not found for firebase UID:', decodedToken.uid)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const problems = await prisma.user_problems.findMany({
        where: { userId: user.id },
        orderBy: { solvedAt: 'desc' }
      })

      return NextResponse.json(problems)
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error in GET /api/problems:', error)
    return NextResponse.json(
      {
        error: 'Error fetching problems',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}