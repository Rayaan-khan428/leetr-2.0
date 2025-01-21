import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { subDays } from 'date-fns'

export async function GET(request: Request) {
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

    // Get problems solved in the last year
    const yearAgo = subDays(new Date(), 365)
    const problems = await prisma.user_problems.findMany({
      where: {
        userId: currentUser.id,
        solvedAt: {
          gte: yearAgo
        }
      },
      select: {
        solvedAt: true
      }
    })

    // Group problems by date
    const activityMap = problems.reduce((acc, problem) => {
      const date = problem.solvedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert to array format expected by the component
    const activityData = Object.entries(activityMap).map(([date, count]) => ({
      date: new Date(date),
      count
    }))

    return NextResponse.json(activityData)
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      {
        error: 'Error fetching activity data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 