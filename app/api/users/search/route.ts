// app/api/users/search/route.ts
import { prisma } from '../../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

type UserWithRequests = {
  id: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  sentRequests: { status: string }[];
  receivedRequests: { status: string }[];
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Auth check
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

    // Search users by displayName or email
    const users = await prisma.users.findMany({
      where: {
        AND: [
          {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          { 
            id: { not: currentUser.id } // Exclude current user
          }
        ]
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        photoURL: true,
        // Include friendship status
        sentRequests: {
          where: { receiverId: currentUser.id },
          select: { status: true }
        },
        receivedRequests: {
          where: { senderId: currentUser.id },
          select: { status: true }
        }
      },
      take: 10 // Limit results
    })

    // Transform the results to include friendship status
    const transformedUsers = (users as UserWithRequests[]).map(user => ({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      friendshipStatus: 
        user.receivedRequests[0]?.status || 
        user.sentRequests[0]?.status || 
        'NONE'
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