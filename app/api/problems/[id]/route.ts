import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/middleware/auth'
import { prisma } from '../../../../prisma/client'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problemId = params.id
    if (!problemId) {
      return new Response('Problem ID is required', { status: 400 })
    }

    // Get the auth token from the request header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify the token and get the user
    const decodedToken = await verifyAuthToken(token)
    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Check if the problem exists and belongs to the user
    const problem = await prisma.user_problems.findUnique({
      where: { id: problemId }
    })

    if (!problem) {
      return new Response('Problem not found', { status: 404 })
    }

    if (problem.userId !== user.id) {
      return new Response('Unauthorized to delete this problem', { status: 403 })
    }

    // Delete the problem
    await prisma.user_problems.delete({
      where: { id: problemId }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return new Response('Failed to delete problem', { status: 500 })
  }
} 