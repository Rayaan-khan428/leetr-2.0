import { verifyAuthToken } from '@/middleware/auth';
import { prisma } from '@/prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) throw new Error('No token provided');

    const decodedToken = await verifyAuthToken(token);
    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { user_settings: true }
    });

    if (!user) throw new Error('User not found');

    return NextResponse.json(user.user_settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) throw new Error('No token provided');

    const decodedToken = await verifyAuthToken(token);
    const updates = await request.json();

    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) throw new Error('User not found');

    const settings = await prisma.user_settings.upsert({
      where: { userId: user.id },
      update: updates,
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        ...updates
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 