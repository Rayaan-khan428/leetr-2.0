import { prisma } from '@/prisma/client'

export async function updateUserStatistics(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      user_statistics: true,
      user_problems: {
        orderBy: { solvedAt: 'desc' },
        take: 2 // Get last two problems to check streak
      }
    }
  })

  if (!user) return null

  const stats = user.user_statistics
  const problems = user.user_problems

  // Calculate streak
  let streak = stats?.streak || 0
  if (problems.length > 0) {
    const lastProblemDate = problems[0].solvedAt
    const prevProblemDate = problems[1]?.solvedAt

    // Check if solved today
    const today = new Date()
    const isToday = lastProblemDate.toDateString() === today.toDateString()

    if (isToday) {
      if (prevProblemDate) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const wasYesterday = prevProblemDate.toDateString() === yesterday.toDateString()
        
        if (wasYesterday) {
          streak += 1
        } else {
          streak = 1
        }
      } else {
        streak = 1
      }
    } else {
      streak = 0
    }
  }

  // Update or create statistics
  const totalSolved = await prisma.user_problems.count({
    where: { userId }
  })

  const updatedStats = await prisma.user_statistics.upsert({
    where: { userId },
    create: {
      id: crypto.randomUUID(),
      userId,
      streak,
      totalSolved,
      lastSolved: problems[0]?.solvedAt || new Date(),
      maxStreak: streak,
      lastStreak: streak > 0 ? streak : stats?.lastStreak || 0
    },
    update: {
      streak,
      totalSolved,
      lastSolved: problems[0]?.solvedAt,
      maxStreak: Math.max(streak, stats?.maxStreak || 0),
      lastStreak: streak > 0 ? streak : stats?.streak || 0
    }
  })

  return updatedStats
} 