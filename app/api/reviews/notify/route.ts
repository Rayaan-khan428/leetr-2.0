import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/utils/notifications";

const DIFFICULTY_EMOJIS = {
  EASY: '🟢',
  MEDIUM: '🟡',
  HARD: '🔴'
} as const;

export async function GET() {
  try {
    console.log('Starting review notification process...');

    // Get all problems that need review today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const problemsToReview = await prisma.user_problems.findMany({
      where: {
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

    console.log(`Found ${problemsToReview.length} problems due for review`);

    // Group problems by user for batch notifications
    const userProblems = problemsToReview.reduce((acc, problem) => {
      const userId = problem.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(problem);
      return acc;
    }, {} as Record<string, typeof problemsToReview>);

    // Send notifications to each user
    for (const [userId, problems] of Object.entries(userProblems)) {
      const user = problems[0].users; // All problems have the same user

      if (!user.phoneNumber || !user.phoneVerified || !user.user_settings?.smsEnabled) {
        console.log(`Skipping notifications for user ${userId} - SMS not enabled or verified`);
        continue;
      }

      const problemList = problems
        .map(p => `${DIFFICULTY_EMOJIS[p.difficulty]} ${p.problemName}`)
        .join('\n');

      const message = [
        `🔔 Time for your daily LeetCode review!`,
        `\nProblems to review today:`,
        problemList,
        `\nLogin to Leetr to start reviewing! 💪`
      ].join('\n');

      await sendSMS(user.phoneNumber, message);
      console.log(`Sent review notification to user ${userId}`);
    }

    return NextResponse.json({ 
      success: true,
      notifiedUsers: Object.keys(userProblems).length,
      totalProblems: problemsToReview.length
    });

  } catch (error) {
    console.error('Error sending review notifications:', error);
    return NextResponse.json(
      { 
        error: "Failed to send review notifications",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 