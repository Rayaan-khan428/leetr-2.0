import twilio from 'twilio';
import { prisma } from '@/prisma/client';

// Add difficulty emojis
const DIFFICULTY_EMOJIS = {
  EASY: '🟢',
  MEDIUM: '🟡',
  HARD: '🔴'
} as const;

function getTwilioClient() {
  console.log('=== Initializing Twilio Client ===');
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  console.log('Twilio configuration:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    phoneNumber
  });
  
  if (!accountSid || !authToken) {
    console.warn('❌ Twilio credentials not configured');
    return null;
  }

  try {
    const client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error);
    return null;
  }
}

function formatNotificationMessage(
  displayName: string | null,
  problemName: string,
  difficulty: string
) {
  const emoji = DIFFICULTY_EMOJIS[difficulty as keyof typeof DIFFICULTY_EMOJIS] || '📝';
  const userName = displayName || 'Your friend';
  const timeStr = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric'
  });
  
  return [
    `${emoji} ${userName} is on a roll!`,
    `Just completed "${problemName}" (${difficulty}) at ${timeStr}.`,
    `Don't fall behind - login to Leetr now! 🚀`
  ].join('\n');
}

export async function sendSMS(to: string, message: string) {
  console.log('\n=== Sending SMS ===');
  console.log('📱 To:', to);
  console.log('💬 Message:', message);
  
  const client = getTwilioClient();
  if (!client) {
    console.warn('❌ SMS not sent: Twilio client not initialized');
    return null;
  }

  try {
    console.log('⏳ Sending message...');
    const result = await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    console.log('✅ SMS sent successfully:', {
      sid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      dateCreated: result.dateCreated,
      price: result.price,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage
    });
    return result;
  } catch (error) {
    console.error('❌ Error sending SMS:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return null;
  }
}

export async function notifyFriendsOfCompletion(
  userId: string,
  problemName: string,
  difficulty: string
) {
  console.log('\n=== Starting Friend Notification Process ===');
  console.log('🎯 Target User:', userId);
  console.log('📝 Problem:', problemName);
  console.log('📊 Difficulty:', difficulty);
  
  try {
    // Get user info with friends and their settings
    console.log('⏳ Fetching user and friend data...');
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        friendsWith: {
          include: {
            user1: {
              include: {
                user_settings: true
              }
            }
          }
        },
        friends: {
          include: {
            user2: {
              include: {
                user_settings: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return;
    }

    console.log('✅ Found user:', {
      id: user.id,
      displayName: user.displayName,
      totalFriends: user.friendsWith.length + user.friends.length
    });

    // Collect all friends who have SMS notifications enabled
    const friends = [
      ...user.friendsWith.map(f => f.user1),
      ...user.friends.map(f => f.user2)
    ].filter(friend => {
      const hasNotifications = friend.user_settings?.friendActivitySMS && 
        friend.user_settings?.smsEnabled &&
        friend.phoneNumber &&
        friend.phoneVerified;
      
      console.log('👥 Friend eligibility check:', {
        id: friend.id,
        displayName: friend.displayName,
        eligible: hasNotifications,
        settings: {
          phoneNumber: friend.phoneNumber ? '✅' : '❌',
          phoneVerified: friend.phoneVerified ? '✅' : '❌',
          smsEnabled: friend.user_settings?.smsEnabled ? '✅' : '❌',
          friendActivitySMS: friend.user_settings?.friendActivitySMS ? '✅' : '❌'
        }
      });

      return hasNotifications;
    });

    console.log(`\n📊 Found ${friends.length} eligible friends for notification`);

    if (friends.length === 0) {
      console.log('ℹ️ No friends to notify');
      return;
    }

    // Replace the inline message with the formatted one
    const message = formatNotificationMessage(
      user.displayName,
      problemName,
      difficulty
    );
    
    console.log('\n=== Sending Notifications ===');
    console.log('📝 Template:', message);

    const notifications = friends.map(friend => {
      if (!friend.phoneNumber || !friend.phoneVerified) {
        console.log('⚠️ No verified phone number for friend:', friend.id);
        return Promise.resolve(null);
      }
      
      console.log('📤 Sending to friend:', {
        id: friend.id,
        displayName: friend.displayName,
        phone: friend.phoneNumber
      });
      
      return sendSMS(friend.phoneNumber, message);
    });

    const results = await Promise.all(notifications);
    console.log('\n=== Notification Summary ===');
    console.log('📊 Total attempts:', results.length);
    console.log('✅ Successful:', results.filter(r => r !== null).length);
    console.log('❌ Failed:', results.filter(r => r === null).length);
  } catch (error) {
    console.error('❌ Error in notification process:', error);
  }
} 