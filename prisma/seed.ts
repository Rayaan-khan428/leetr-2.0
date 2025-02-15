import { PrismaClient, Difficulty, FriendshipRequestStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const LEETCODE_PROBLEMS = [
  { id: '1', name: 'Two Sum', difficulty: Difficulty.EASY },
  { id: '20', name: 'Valid Parentheses', difficulty: Difficulty.EASY },
  { id: '21', name: 'Merge Two Sorted Lists', difficulty: Difficulty.EASY },
  { id: '53', name: 'Maximum Subarray', difficulty: Difficulty.MEDIUM },
  { id: '70', name: 'Climbing Stairs', difficulty: Difficulty.EASY },
  { id: '94', name: 'Binary Tree Inorder Traversal', difficulty: Difficulty.EASY },
  { id: '121', name: 'Best Time to Buy and Sell Stock', difficulty: Difficulty.EASY },
  { id: '141', name: 'Linked List Cycle', difficulty: Difficulty.EASY },
  { id: '200', name: 'Number of Islands', difficulty: Difficulty.MEDIUM },
  { id: '206', name: 'Reverse Linked List', difficulty: Difficulty.EASY },
  { id: '217', name: 'Contains Duplicate', difficulty: Difficulty.EASY },
  { id: '238', name: 'Product of Array Except Self', difficulty: Difficulty.MEDIUM },
  { id: '242', name: 'Valid Anagram', difficulty: Difficulty.EASY },
  { id: '347', name: 'Top K Frequent Elements', difficulty: Difficulty.MEDIUM },
  { id: '424', name: 'Longest Repeating Character Replacement', difficulty: Difficulty.MEDIUM },
  { id: '435', name: 'Non-overlapping Intervals', difficulty: Difficulty.MEDIUM },
  { id: '572', name: 'Subtree of Another Tree', difficulty: Difficulty.EASY },
  { id: '647', name: 'Palindromic Substrings', difficulty: Difficulty.MEDIUM },
  { id: '739', name: 'Daily Temperatures', difficulty: Difficulty.MEDIUM },
  { id: '853', name: 'Car Fleet', difficulty: Difficulty.MEDIUM },
  { id: '875', name: 'Koko Eating Bananas', difficulty: Difficulty.MEDIUM },
  { id: '981', name: 'Time Based Key-Value Store', difficulty: Difficulty.MEDIUM },
  { id: '23', name: 'Merge k Sorted Lists', difficulty: Difficulty.HARD },
  { id: '76', name: 'Minimum Window Substring', difficulty: Difficulty.HARD },
  { id: '84', name: 'Largest Rectangle in Histogram', difficulty: Difficulty.HARD },
  { id: '127', name: 'Word Ladder', difficulty: Difficulty.HARD },
  { id: '212', name: 'Word Search II', difficulty: Difficulty.HARD },
  { id: '295', name: 'Find Median from Data Stream', difficulty: Difficulty.HARD },
  { id: '460', name: 'LFU Cache', difficulty: Difficulty.HARD },
  { id: '472', name: 'Concatenated Words', difficulty: Difficulty.HARD },
]

const TIME_COMPLEXITIES = ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'O(1)']
const SPACE_COMPLEXITIES = ['O(n)', 'O(1)', 'O(log n)', 'O(n²)']

const TARGET_EMAIL = 'rayaan.k.ca@gmail.com'
async function main() {
  // Find the existing user
  const user = await prisma.users.findUnique({
    where: { email: TARGET_EMAIL }
  })

  if (!user) {
    console.error('User not found! Make sure to sign in first.')
    process.exit(1)
  }

  // Clean existing user data
  await prisma.user_problems.deleteMany({
    where: { userId: user.id }
  })
  await prisma.user_statistics.deleteMany({
    where: { userId: user.id }
  })

  // Create problems with dates spread over the last year
  const numProblems = Math.floor(Math.random() * 21) + 10 // Random number between 10 and 30
  const selectedProblems = [...LEETCODE_PROBLEMS]
    .sort(() => Math.random() - 0.5)
    .slice(0, numProblems) // Create random number of problems

  const problemsData = selectedProblems.map(problem => {
    const daysAgo = Math.floor(Math.random() * 365)
    const solvedAt = new Date()
    solvedAt.setDate(solvedAt.getDate() - daysAgo)

    return {
      id: uuidv4(),
      userId: user.id,
      leetcodeId: problem.id,
      problemName: problem.name,
      difficulty: problem.difficulty,
      solution: `// Solution for ${problem.name}\nfunction solution() {\n  // Implementation\n}`,
      notes: `Notes for ${problem.name}`,
      attempts: Math.floor(Math.random() * 3) + 1,
      timeComplexity: TIME_COMPLEXITIES[Math.floor(Math.random() * TIME_COMPLEXITIES.length)],
      spaceComplexity: SPACE_COMPLEXITIES[Math.floor(Math.random() * SPACE_COMPLEXITIES.length)],
      url: `https://leetcode.com/problems/${problem.name.toLowerCase().replace(/\s+/g, '-')}/`,
      solvedAt,
      nextReview: new Date(solvedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdAt: solvedAt,
      updatedAt: solvedAt,
    }
  })

  await prisma.user_problems.createMany({
    data: problemsData
  })

  // Calculate statistics
  const problems = await prisma.user_problems.findMany({
    where: { userId: user.id },
    orderBy: { solvedAt: 'desc' }
  })

  // Calculate streak
  let streak = 0
  let currentDate = new Date()
  let currentStreak = 0
  
  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const hasProblemsOnDate = problems.some(
      p => p.solvedAt.toISOString().split('T')[0] === dateStr
    )
    
    if (hasProblemsOnDate) {
      currentStreak++
    } else {
      break
    }
    
    currentDate.setDate(currentDate.getDate() - 1)
  }
  streak = currentStreak

  // Create user statistics
  await prisma.user_statistics.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      streak,
      lastStreak: Math.max(streak - 1, 0),
      maxStreak: Math.max(streak, Math.floor(Math.random() * 10) + 5),
      totalSolved: problems.length,
      lastSolved: problems[0]?.solvedAt || new Date(),
    }
  })

  console.log(`Successfully seeded data for user ${TARGET_EMAIL}:`)
  console.log(`- Created ${problemsData.length} problems`)
  console.log(`- Current streak: ${streak}`)
  console.log(`- Total solved: ${problems.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })