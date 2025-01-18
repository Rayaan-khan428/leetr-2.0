import { PrismaClient, Difficulty } from '@prisma/client'
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

async function main() {
  const USER_EMAIL = 'shahmeer@gmail.com' // The email to populate problems for

  // Clean existing problems for this user
  const user = await prisma.users.findUnique({
    where: { email: USER_EMAIL }
  })

  if (!user) {
    console.error('User not found!')
    return
  }

  await prisma.user_problems.deleteMany({
    where: { userId: user.id }
  })

  // Randomly select 15 problems
  const selectedProblems = [...LEETCODE_PROBLEMS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 15)

  // Create the problems
  const problemsData = selectedProblems.map(problem => ({
    id: uuidv4(),
    userId: user.id,
    leetcodeId: problem.id,
    problemName: problem.name,
    difficulty: problem.difficulty,
    solution: `// Solution for ${problem.name}\nfunction solution() {\n  // TODO: Implement solution\n}`,
    notes: `Key points to remember:\n- Break down the problem\n- Consider edge cases\n- Think about optimization`,
    attempts: Math.floor(Math.random() * 3) + 1,
    timeComplexity: TIME_COMPLEXITIES[Math.floor(Math.random() * TIME_COMPLEXITIES.length)],
    spaceComplexity: SPACE_COMPLEXITIES[Math.floor(Math.random() * SPACE_COMPLEXITIES.length)],
    url: `https://leetcode.com/problems/${problem.name.toLowerCase().replace(/\s+/g, '-')}/`,
    nextReview: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within next 7 days
    solvedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
  }))

  await prisma.user_problems.createMany({
    data: problemsData
  })

  console.log(`Successfully added ${problemsData.length} problems for user ${USER_EMAIL}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })