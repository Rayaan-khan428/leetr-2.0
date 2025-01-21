import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

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

    // Get all friends
    const friendships = await prisma.friendships.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      },
      include: {
        user1: {
          include: {
            user_statistics: true,
            user_problems: {
              where: {
                solvedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            }
          }
        },
        user2: {
          include: {
            user_statistics: true,
            user_problems: {
              where: {
                solvedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            }
          }
        }
      }
    })

    // Transform data for leaderboard
    const leaderboardData = friendships.map(friendship => {
      const friend = friendship.user1Id === currentUser.id ? friendship.user2 : friendship.user1
      const stats = friend.user_statistics
      const recentProblems = friend.user_problems

      return {
        id: friend.id,
        displayName: friend.displayName,
        email: friend.email,
        photoURL: friend.photoURL,
        stats: {
          totalSolved: stats?.totalSolved || 0,
          streak: stats?.streak || 0,
          lastActive: stats?.lastSolved || new Date(),
          consistency: (recentProblems.length / 7) * 100 // % of days active in last week
        }
      }
    })

    // Add current user to leaderboard
    const currentUserStats = await prisma.user_statistics.findUnique({
      where: { userId: currentUser.id }
    })

    const currentUserRecentProblems = await prisma.user_problems.count({
      where: {
        userId: currentUser.id,
        solvedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    leaderboardData.push({
      id: currentUser.id,
      displayName: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      stats: {
        totalSolved: currentUserStats?.totalSolved || 0,
        streak: currentUserStats?.streak || 0,
        lastActive: currentUserStats?.lastSolved || new Date(),
        consistency: (currentUserRecentProblems / 7) * 100
      }
    })

    // Sort by total solved
    leaderboardData.sort((a, b) => b.stats.totalSolved - a.stats.totalSolved)

    return NextResponse.json(leaderboardData)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      {
        error: 'Error fetching statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 