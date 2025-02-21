import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/utils/notifications";

// Helper to set next review date for testing
async function setTestReviewDate(userId: string) {
  // First find 3 problems without a next review date
  const problems = await prisma.user_problems.findMany({
    where: {
      userId: userId,
      nextReview: null
    },
    take: 3
  });

  // Then update them individually
  const today = new Date();
  
  for (const problem of problems) {
    await prisma.user_problems.update({
      where: {
        id: problem.id
      },
      data: {
        nextReview: today
      }
    });
  }

  return problems.length;
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Set up test data
    await setTestReviewDate(userId);

    // Trigger the notification logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const problemsToReview = await prisma.user_problems.findMany({
      where: {
        userId: userId,
        nextReview: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        users: {
          include: {
            user_settings: true
          }
        }
      }
    });

    if (problemsToReview.length === 0) {
      return NextResponse.json({ 
        message: "No problems found for review",
        userId 
      });
    }

    const user = problemsToReview[0].users;

    if (!user.phoneNumber || !user.phoneVerified || !user.user_settings?.smsEnabled) {
      return NextResponse.json({ 
        error: "User not eligible for SMS",
        details: {
          hasPhone: !!user.phoneNumber,
          isVerified: user.phoneVerified,
          smsEnabled: user.user_settings?.smsEnabled
        }
      });
    }

    const problemList = problemsToReview
      .map(p => `${p.difficulty} ${p.problemName}`)
      .join('\n');

    const message = [
      `🔔 Time for your daily LeetCode review!`,
      `\nProblems to review today:`,
      problemList,
      `\nLogin to Leetr to start reviewing! 💪`
    ].join('\n');

    const smsResult = await sendSMS(user.phoneNumber, message);

    return NextResponse.json({ 
      success: true,
      problemsFound: problemsToReview.length,
      message,
      smsResult
    });

  } catch (error) {
    console.error('Error in test notification:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 