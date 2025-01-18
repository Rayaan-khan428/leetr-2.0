// app/api/friends/requests/[id]/route.ts
import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH request received for friend request ID:', params.id)
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No token provided in request')
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyAuthToken(token)
    console.log('Token verified for user:', decodedToken.uid)
    
    const currentUser = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    })

    if (!currentUser) {
      console.log('User not found for firebaseUid:', decodedToken.uid)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body
    console.log('Requested status update:', status)
    
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      console.log('Invalid status received:', status)
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Find and verify the friend request
    const friendRequest = await prisma.friend_requests.findUnique({
      where: {
        id: params.id,
      },
      include: {
        sender: true,
        receiver: true
      }
    })

    console.log('Found friend request:', friendRequest)

    if (!friendRequest) {
      console.log('Friend request not found with ID:', params.id)
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    // Verify the current user is the receiver
    if (friendRequest.receiverId !== currentUser.id) {
      console.log('Authorization failed. Request receiver:', friendRequest.receiverId, 'Current user:', currentUser.id)
      return NextResponse.json(
        { error: 'Not authorized to update this request' },
        { status: 403 }
      )
    }

    // Update the request status and create friendship if accepted
    try {
      const result = await prisma.$transaction(async (prisma) => {
        console.log('Starting transaction for status update')
        
        // Update request status
        const updatedRequest = await prisma.friend_requests.update({
          where: { id: params.id },
          data: { status }
        })
        console.log('Updated friend request status:', updatedRequest)

        // If accepted, check if friendship exists before creating
        if (status === 'ACCEPTED') {
          // Check both directions of the friendship
          const existingFriendship = await prisma.friendships.findFirst({
            where: {
              OR: [
                {
                  AND: [
                    { user1Id: friendRequest.senderId },
                    { user2Id: friendRequest.receiverId }
                  ]
                },
                {
                  AND: [
                    { user1Id: friendRequest.receiverId },
                    { user2Id: friendRequest.senderId }
                  ]
                }
              ]
            }
          })

          if (!existingFriendship) {
            const friendship = await prisma.friendships.create({
              data: {
                id: uuidv4(),
                user1Id: friendRequest.senderId,
                user2Id: friendRequest.receiverId
              }
            })
            console.log('Created new friendship:', friendship)
          } else {
            console.log('Friendship already exists:', existingFriendship)
          }
        }

        return updatedRequest
      })

      console.log('Transaction completed successfully')
      return NextResponse.json(result)
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError)
      throw transactionError
    }
  } catch (error) {
    console.error('Error updating friend request:', error)
    return NextResponse.json(
      {
        error: 'Error updating friend request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}