// app/api/friends/route.ts
import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

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

    // Fetch all friendships where the current user is either user1 or user2
    const friendships = await prisma.friendships.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true
          }
        }
      }
    })

    // Transform the data to get a flat list of friends
    const friends = friendships.map(friendship => {
      const friend = friendship.user1Id === currentUser.id 
        ? friendship.user2 
        : friendship.user1
      
      return {
        friendshipId: friendship.id,
        ...friend
      }
    })

    return NextResponse.json(friends)
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json(
      {
        error: 'Error fetching friends',
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