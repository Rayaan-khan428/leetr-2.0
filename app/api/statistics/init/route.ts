import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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
    const currentUser = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if statistics already exist
    let userStats = await prisma.user_statistics.findUnique({
      where: { userId: currentUser.id }
    })

    if (!userStats) {
      // Calculate initial statistics
      const totalSolved = await prisma.user_problems.count({
        where: { userId: currentUser.id }
      })

      const lastProblem = await prisma.user_problems.findFirst({
        where: { userId: currentUser.id },
        orderBy: { solvedAt: 'desc' }
      })

      // Create initial statistics
      userStats = await prisma.user_statistics.create({
        data: {
          id: uuidv4(),
          userId: currentUser.id,
          totalSolved,
          lastSolved: lastProblem?.solvedAt || null,
          streak: 0 // Initial streak
        }
      })
    }

    return NextResponse.json(userStats)
  } catch (error) {
    console.error('Error initializing statistics:', error)
    return NextResponse.json(
      {
        error: 'Error initializing statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 