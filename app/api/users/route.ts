// app/api/users/route.ts
import { prisma } from '../../../prisma/client'
import { verifyAuthToken } from '@/middleware/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' }, 
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const firebaseUid = decodedToken.uid;

    // Parse the request body
    const { email, displayName, photoURL } = await request.json();

    // Create the user - note how we're using the exact field names from the schema
    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        firebaseUid,
        email,
        // Fields that match our schema exactly
        displayName: displayName || null,
        photoURL: photoURL || null,
        emailVerified: false,
        updatedAt: new Date(), // Add this since it's not @updatedAt
        user_settings: {
          create: {
            id: uuidv4(),
            timezone: 'UTC',
            smsEnabled: false,
            updatedAt: new Date()
          }
        }
      },
      include: {
        user_settings: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Error creating user', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}