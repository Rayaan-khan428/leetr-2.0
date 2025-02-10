import { NextResponse } from 'next/server';
import { notifyFriendsOfCompletion } from '@/lib/utils/notifications';
import { prisma } from '@/prisma/client';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    console.log('=== Starting Test Notification ===');
    console.log('Testing notifications for user:', userId);

    // Verify user exists and get their info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_settings: true
      }
    });

    if (!user) {
      console.log('Test failed: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Test user info:', {
      id: user.id,
      displayName: user.displayName,
      phoneVerified: user.phoneVerified,
      hasSettings: !!user.user_settings,
      smsEnabled: user.user_settings?.smsEnabled,
      friendActivitySMS: user.user_settings?.friendActivitySMS
    });

    // Send test notification
    await notifyFriendsOfCompletion(
      userId,
      'Test Problem',
      'MEDIUM'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test notification failed:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
} 