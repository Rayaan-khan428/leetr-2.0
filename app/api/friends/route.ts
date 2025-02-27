import { prisma } from '@/prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Retrieve friends list
 *     description: Retrieves the logged in user's friends list
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   friendshipId:
 *                     type: string
 *                   id:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                     nullable: true
 *                   email:
 *                     type: string
 *                   photoURL:
 *                     type: string
 *                     nullable: true
 *                   problemStats:
 *                     type: object
 *                     properties:
 *                       totalProblems:
 *                         type: number
 *                       easy:
 *                         type: number
 *                       medium:
 *                         type: number
 *                       hard:
 *                         type: number
 *                       recentlySolved:
 *                         type: number
 *       401:
 *         description: No token provided or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Remove a friend
 *     description: Removes a friend connection between users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendshipId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *       401:
 *         description: No token provided or invalid token
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
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
            photoURL: true,
            user_problems: {
              select: {
                difficulty: true,
                solvedAt: true,
                mainCategory: true,
                subCategories: true,
              }
            },
            user_statistics: true
          }
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            email: true,
            photoURL: true,
            user_problems: {
              select: {
                difficulty: true,
                solvedAt: true,
                mainCategory: true,
                subCategories: true,
              }
            },
            user_statistics: true
          }
        }
      }
    })

    // Transform the data to get a flat list of friends with problem statistics
    const friends = friendships.map(friendship => {
      const friend = friendship.user1Id === currentUser.id 
        ? friendship.user2 
        : friendship.user1
      
      // Calculate problem statistics
      const problemStats = {
        totalProblems: friend.user_problems.length,
        easy: friend.user_problems.filter(p => p.difficulty === 'EASY').length,
        medium: friend.user_problems.filter(p => p.difficulty === 'MEDIUM').length,
        hard: friend.user_problems.filter(p => p.difficulty === 'HARD').length,
        recentlySolved: friend.user_problems
          .filter(p => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(p.solvedAt) > oneWeekAgo;
          }).length,
        categories: {
          // Count by main category
          ARRAY_STRING: friend.user_problems.filter(p => p.mainCategory === 'ARRAY_STRING').length,
          HASH_BASED: friend.user_problems.filter(p => p.mainCategory === 'HASH_BASED').length,
          LINKED: friend.user_problems.filter(p => p.mainCategory === 'LINKED').length,
          STACK_QUEUE: friend.user_problems.filter(p => p.mainCategory === 'STACK_QUEUE').length,
          TREE: friend.user_problems.filter(p => p.mainCategory === 'TREE').length,
          GRAPH: friend.user_problems.filter(p => p.mainCategory === 'GRAPH').length,
          
          // Count by subcategories
          ARRAY: friend.user_problems.filter(p => p.subCategories.includes('ARRAY')).length,
          STRING: friend.user_problems.filter(p => p.subCategories.includes('STRING')).length,
          TWO_POINTERS: friend.user_problems.filter(p => p.subCategories.includes('TWO_POINTERS')).length,
          SLIDING_WINDOW: friend.user_problems.filter(p => p.subCategories.includes('SLIDING_WINDOW')).length,
          MATRIX: friend.user_problems.filter(p => p.subCategories.includes('MATRIX')).length,
          
          HASH_MAP: friend.user_problems.filter(p => p.subCategories.includes('HASH_MAP')).length,
          HASH_SET: friend.user_problems.filter(p => p.subCategories.includes('HASH_SET')).length,
          
          SINGLY_LINKED: friend.user_problems.filter(p => p.subCategories.includes('SINGLY_LINKED')).length,
          DOUBLY_LINKED: friend.user_problems.filter(p => p.subCategories.includes('DOUBLY_LINKED')).length,
          CIRCULAR_LINKED: friend.user_problems.filter(p => p.subCategories.includes('CIRCULAR_LINKED')).length,
          
          STACK: friend.user_problems.filter(p => p.subCategories.includes('STACK')).length,
          QUEUE: friend.user_problems.filter(p => p.subCategories.includes('QUEUE')).length,
          DEQUE: friend.user_problems.filter(p => p.subCategories.includes('DEQUE')).length,
          PRIORITY_QUEUE: friend.user_problems.filter(p => p.subCategories.includes('PRIORITY_QUEUE')).length,
          
          BINARY_TREE: friend.user_problems.filter(p => p.subCategories.includes('BINARY_TREE')).length,
          BINARY_SEARCH_TREE: friend.user_problems.filter(p => p.subCategories.includes('BINARY_SEARCH_TREE')).length,
          NARY_TREE: friend.user_problems.filter(p => p.subCategories.includes('NARY_TREE')).length,
          TRIE: friend.user_problems.filter(p => p.subCategories.includes('TRIE')).length,
          SEGMENT_TREE: friend.user_problems.filter(p => p.subCategories.includes('SEGMENT_TREE')).length,
          
          DIRECTED_GRAPH: friend.user_problems.filter(p => p.subCategories.includes('DIRECTED_GRAPH')).length,
          UNDIRECTED_GRAPH: friend.user_problems.filter(p => p.subCategories.includes('UNDIRECTED_GRAPH')).length,
          DFS: friend.user_problems.filter(p => p.subCategories.includes('DFS')).length,
          BFS: friend.user_problems.filter(p => p.subCategories.includes('BFS')).length,
          TOPOLOGICAL_SORT: friend.user_problems.filter(p => p.subCategories.includes('TOPOLOGICAL_SORT')).length,
        }
      }

      return {
        friendshipId: friendship.id,
        id: friend.id,
        displayName: friend.displayName,
        email: friend.email,
        photoURL: friend.photoURL,
        problemStats,
        user_statistics: friend.user_statistics
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