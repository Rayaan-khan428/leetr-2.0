import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'

// Add this to debug Firebase initialization
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
})

describe('Users Search API', () => {
  let authToken: string

  beforeAll(async () => {
    try {
      // We don't need to create a test user since we have seeded data
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

  // No need for afterAll cleanup since we're using seed data

  it('should search users successfully by displayName', async () => {
    const response = await fetch('http://localhost:3000/api/users/search?q=Jon', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    
    const testUser = data.find((user: any) => user.email === 'jon1@example.com')
    expect(testUser).toBeDefined()
    expect(testUser?.displayName).toBe('Jon One')
    expect(testUser?.friendshipStatus).toBe('NONE')
  })

  it('should search users successfully by email', async () => {
    const response = await fetch('http://localhost:3000/api/users/search?q=test@example', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    const data = await response.json()
    if (response.status !== 200) {
      console.error('Search error:', data)
    }

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    
    const testUser = data.find((user: any) => user.email === 'test@example.com')
    expect(testUser).toBeDefined()
  })

  it('should return 401 without auth token', async () => {
    const response = await fetch('http://localhost:3000/api/users/search?q=test')
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('No token provided')
  })
}) 