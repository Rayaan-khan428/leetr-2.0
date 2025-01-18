import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../../../../prisma/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'

describe('Friend Request Management API', () => {
  let authToken: string
  let jon3Id: string
  let rayaanId: string
  let requestId: string

  beforeAll(async () => {
    try {
      // Get the existing users from seed data
      const jon3 = await prisma.users.findUnique({
        where: { email: 'jon3@example.com' }
      })
      const rayaan = await prisma.users.findUnique({
        where: { email: 'rayaan1516@gmail.com' }
      })

      if (!jon3 || !rayaan) {
        throw new Error('Seed data not found')
      }

      jon3Id = jon3.id
      rayaanId = rayaan.id
      requestId = uuidv4()

      // Create friend request using relation
      await prisma.users.update({
        where: { id: jon3Id },
        data: {
          sentRequests: {
            create: {
              id: requestId,
              receiverId: rayaanId,
              status: 'PENDING'
            }
          }
        }
      })

      // Get auth token
      const userCredential = await signInWithEmailAndPassword(
        auth,
        process.env.TEST_USER_EMAIL || 'rayaan1516@gmail.com',
        process.env.TEST_USER_PASSWORD || 'Password123'
      )
      
      authToken = await userCredential.user.getIdToken()
    } catch (error) {
      console.error('Setup error:', error)
      throw error
    }
  })

  afterAll(async () => {
    // Clean up only what we created
    try {
      await prisma.friend_requests.deleteMany({
        where: { id: requestId }
      })
      await prisma.friendships.deleteMany({
        where: {
          OR: [
            { user1Id: jon3Id, user2Id: rayaanId },
            { user1Id: rayaanId, user2Id: jon3Id }
          ]
        }
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('PATCH /api/friends/requests/[id]', () => {
    it('should accept a friend request', async () => {
      const response = await fetch(`http://localhost:3000/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ACCEPTED'
        })
      })

      const data = await response.json()
      if (response.status !== 200) {
        console.error('Accept request error:', data)
      }

      expect(response.status).toBe(200)
      expect(data.status).toBe('ACCEPTED')

      // Verify friendship was created
      const friendship = await prisma.friendships.findFirst({
        where: {
          OR: [
            { user1Id: jon3Id, user2Id: rayaanId },
            { user1Id: rayaanId, user2Id: jon3Id }
          ]
        }
      })
      expect(friendship).toBeDefined()
    })
  })

  describe('DELETE /api/friends/requests/[id]', () => {
    it('should delete a friend request', async () => {
      const response = await fetch(`http://localhost:3000/api/friends/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()
      if (response.status !== 200) {
        console.error('Delete request error:', data)
      }

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify request was deleted
      const request = await prisma.friend_requests.findUnique({
        where: { id: requestId }
      })
      expect(request).toBeNull()
    })

    it('should return 404 for non-existent request', async () => {
      const response = await fetch(`http://localhost:3000/api/friends/requests/${uuidv4()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()
      expect(response.status).toBe(404)
      expect(data.error).toBe('Friend request not found')
    })
  })
}) 