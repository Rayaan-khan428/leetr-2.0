import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    // Get all friends with their problem stats in a single query
    const friendsWithStats = await prisma.friendships.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      },
      select: {
        id: true,
        user1: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true,
            user_statistics: {
              select: {
                totalSolved: true,
                streak: true,
                lastSolved: true
              }
            },
            user_problems: {
              where: {
                solvedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              },
              select: {
                difficulty: true,
                solvedAt: true
              }
            }
          }
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true,
            user_statistics: {
              select: {
                totalSolved: true,
                streak: true,
                lastSolved: true
              }
            },
            user_problems: {
              where: {
                solvedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              },
              select: {
                difficulty: true,
                solvedAt: true
              }
            }
          }
        }
      }
    })

    // Transform the data efficiently
    const transformedFriends = friendsWithStats.map(friendship => {
      const friend = friendship.user1.id === currentUser.id ? friendship.user2 : friendship.user1
      const recentProblems = friend.user_problems
      
      const problemStats = {
        totalProblems: friend.user_statistics?.totalSolved || 0,
        streak: friend.user_statistics?.streak || 0,
        lastSolved: friend.user_statistics?.lastSolved,
        easy: 0,
        medium: 0,
        hard: 0,
        recentlySolved: recentProblems.length
      }

      // Count difficulties in a single pass
      recentProblems.forEach(problem => {
        const difficulty = problem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
        problemStats[difficulty] += 1
      })

      return {
        friendshipId: friendship.id,
        id: friend.id,
        displayName: friend.displayName,
        email: friend.email,
        photoURL: friend.photoURL,
        problemStats
      }
    })

    return NextResponse.json(transformedFriends)
  } catch (error) {
    console.error('Error fetching friends statistics:', error)
    return NextResponse.json(
      {
        error: 'Error fetching friends statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 