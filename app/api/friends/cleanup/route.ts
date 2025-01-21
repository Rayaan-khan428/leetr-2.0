import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

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

    // Delete all friend requests involving the user
    await prisma.friend_requests.deleteMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ]
      }
    })

    // Delete all friendships involving the user
    await prisma.friendships.deleteMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cleaning up friend data:', error)
    return NextResponse.json(
      { error: 'Failed to clean up friend data' },
      { status: 500 }
    )
  }
} 