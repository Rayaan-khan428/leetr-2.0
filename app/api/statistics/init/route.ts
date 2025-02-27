import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    // Get user's problems
    const problems = await prisma.user_problems.findMany({
      where: { userId: currentUser.id },
      orderBy: { solvedAt: 'desc' }
    })

    // Calculate streak
    let streak = 0
    let currentDate = new Date()
    let currentStreak = 0
    
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const hasProblemsOnDate = problems.some(
        p => p.solvedAt.toISOString().split('T')[0] === dateStr
      )
      
      if (hasProblemsOnDate) {
        currentStreak++
      } else {
        break
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }
    streak = currentStreak

    // Create or update user statistics
    const stats = await prisma.user_statistics.upsert({
      where: { userId: currentUser.id },
      create: {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        streak,
        lastStreak: Math.max(streak - 1, 0),
        maxStreak: streak,
        totalSolved: problems.length,
        lastSolved: problems[0]?.solvedAt || null,
      },
      update: {
        streak,
        lastStreak: Math.max(streak - 1, 0),
        maxStreak: Math.max(streak, streak),
        totalSolved: problems.length,
        lastSolved: problems[0]?.solvedAt || null,
      }
    })

    return NextResponse.json(stats)
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