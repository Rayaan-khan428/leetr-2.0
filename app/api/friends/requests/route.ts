// app/api/friends/route.ts
import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * @swagger
 * /api/friends/requests:
 *   get:
 *     summary: Get friend requests
 *     description: Retrieves all pending friend requests for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Friend requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   sender:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                         nullable: true
 *                       email:
 *                         type: string
 *                       photoURL:
 *                         type: string
 *                         nullable: true
 *   post:
 *     summary: Send friend request
 *     description: Sends a friend request to another user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 */
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

    // Fetch friend requests where the current user is the receiver
    const friendRequests = await prisma.friend_requests.findMany({
      where: {
        receiverId: currentUser.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        }
      }
    })

    return NextResponse.json(friendRequests)
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json(
      {
        error: 'Error fetching friend requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    const { receiverId } = await request.json()
    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      )
    }

    // Check if a friend request already exists
    const existingRequest = await prisma.friend_requests.findFirst({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: currentUser.id,
          }
        ]
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      )
    }

    // Check if they're already friends
    const existingFriendship = await prisma.friendships.findFirst({
      where: {
        OR: [
          {
            user1Id: currentUser.id,
            user2Id: receiverId,
          },
          {
            user1Id: receiverId,
            user2Id: currentUser.id,
          }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Already friends' },
        { status: 400 }
      )
    }

    // Create new friend request
    const friendRequest = await prisma.friend_requests.create({
      data: {
        id: uuidv4(),
        senderId: currentUser.id,
        receiverId: receiverId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        },
        receiver: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        }
      }
    })

    return NextResponse.json(friendRequest)
  } catch (error) {
    console.error('Error creating friend request:', error)
    return NextResponse.json(
      {
        error: 'Error creating friend request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove a friend
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const { friendshipId } = await request.json()
    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
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

    // Verify the friendship exists and belongs to the current user
    const friendship = await prisma.friendships.findFirst({
      where: {
        id: friendshipId,
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      )
    }

    // Delete the friendship
    await prisma.friendships.delete({
      where: { id: friendshipId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json(
      {
        error: 'Error removing friend',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}