import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../../../prisma/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'

describe('Friend Requests API', () => {
  let authToken: string
  let jon1Id: string
  let jon2Id: string

  beforeAll(async () => {
    try {
      // Get the existing users from seed data
      const jon1 = await prisma.users.findUnique({
        where: { email: 'jon1@example.com' }
      })
      const jon2 = await prisma.users.findUnique({
        where: { email: 'jon2@example.com' }
      })

      if (!jon1 || !jon2) {
        throw new Error('Seed data not found')
      }

      jon1Id = jon1.id
      jon2Id = jon2.id

      // Get auth token
      const userCredential = await signInWithEmailAndPassword(
        auth,
        process.env.TEST_USER_EMAIL || 'rayaan1516@gmail.com',
        process.env.TEST_USER_PASSWORD || 'Password123'
      )
      
      authToken = await userCredential.user.getIdToken()
      
      if (!authToken) {
        throw new Error('Failed to get auth token')
      }
    } catch (error) {
      console.error('Setup error:', error)
      throw error
    }
  })

  afterAll(async () => {
    // Clean up only the friend requests we created
    try {
      await prisma.friend_requests.deleteMany({
        where: {
          OR: [
            { senderId: jon1Id, receiverId: jon2Id },
            { senderId: jon2Id, receiverId: jon1Id }
          ]
        }
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('POST /api/friends/requests', () => {
    it('should create a friend request successfully', async () => {
      const response = await fetch('http://localhost:3000/api/friends/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: jon2Id
        })
      })

      const data = await response.json()
      if (response.status !== 201) {
        console.error('Create request error:', data)
      }

      expect(response.status).toBe(201)
      expect(data.senderId).toBeDefined()
      expect(data.receiverId).toBe(jon2Id)
      expect(data.status).toBe('PENDING')
    })

    it('should prevent duplicate friend requests', async () => {
      const response = await fetch('http://localhost:3000/api/friends/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: jon2Id
        })
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Friend request already exists')
    })
  })

  describe('GET /api/friends/requests', () => {
    it('should fetch friend requests', async () => {
      const response = await fetch('http://localhost:3000/api/friends/requests', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()
      if (response.status !== 200) {
        console.error('Fetch requests error:', data)
      }

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      
      // Should find the request we created
      const request = data.find((req: any) => req.receiverId === jon2Id)
      expect(request).toBeDefined()
      expect(request.status).toBe('PENDING')
    })

    it('should return 401 without auth token', async () => {
      const response = await fetch('http://localhost:3000/api/friends/requests')
      const data = await response.json()
      expect(response.status).toBe(401)
      expect(data.error).toBe('No token provided')
    })
  })
}) 