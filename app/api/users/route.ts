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

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { firebaseUid },
      include: { user_settings: true }
    });

    if (existingUser) {
      return NextResponse.json(existingUser, { status: 409 }); // Return existing user with 409 Conflict
    }

    // Parse the request body
    const { email, displayName, photoURL } = await request.json();

    // Create the user with only the fields that exist in our schema
    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        firebaseUid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        phoneVerified: false,    // Initialize phone verification status
        updatedAt: new Date(),
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