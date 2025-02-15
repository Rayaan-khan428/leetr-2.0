// app/api/users/search/route.ts
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

    // Get search query from URL
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Optimized search query using the new compound index
    const users = await prisma.users.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } }
            ]
          },
          { id: { not: currentUser.id } }
        ]
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        photoURL: true,
        // Optimize friend status check
        _count: {
          select: {
            friends: {
              where: {
                OR: [
                  { user2Id: currentUser.id },
                  { user1Id: currentUser.id }
                ]
              }
            }
          }
        }
      },
      take: 10 // Limit results for better performance
    })

    // Transform results to include friendship status
    const transformedUsers = users.map(user => ({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      friendshipStatus: user._count.friends > 0 ? 'ACCEPTED' : 'NONE'
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      {
        error: 'Error searching users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}