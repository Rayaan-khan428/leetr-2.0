import { PrismaClient, Difficulty, FriendshipRequestStatus, MainCategory, SubCategory } from '@prisma/client'
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

const TARGET_EMAIL = 'rayaan1516@gmail.com'

const sampleProblems = [
  {
    leetcodeId: "1",
    problemName: "Two Sum",
    difficulty: "EASY" as Difficulty,
    solution: "Using a hash map to store complements...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    mainCategory: "HASH_BASED" as MainCategory,
    subCategories: ["HASH_MAP"] as SubCategory[],
  },
  {
    leetcodeId: "20",
    problemName: "Valid Parentheses",
    difficulty: "EASY" as Difficulty,
    solution: "Using a stack to track opening brackets...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    mainCategory: "STACK_QUEUE" as MainCategory,
    subCategories: ["STACK"] as SubCategory[],
  },
  {
    leetcodeId: "121",
    problemName: "Best Time to Buy and Sell Stock",
    difficulty: "EASY" as Difficulty,
    solution: "Using one pass with tracking minimum...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    mainCategory: "ARRAY_STRING" as MainCategory,
    subCategories: ["ARRAY"] as SubCategory[],
  },
  {
    leetcodeId: "200",
    problemName: "Number of Islands",
    difficulty: "MEDIUM" as Difficulty,
    solution: "Using DFS to explore connected land...",
    timeComplexity: "O(m*n)",
    spaceComplexity: "O(m*n)",
    mainCategory: "GRAPH" as MainCategory,
    subCategories: ["DFS", "MATRIX"] as SubCategory[],
  },
  {
    leetcodeId: "206",
    problemName: "Reverse Linked List",
    difficulty: "EASY" as Difficulty,
    solution: "Using three pointers approach...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    mainCategory: "LINKED" as MainCategory,
    subCategories: ["SINGLY_LINKED"] as SubCategory[],
  },
  {
    leetcodeId: "3",
    problemName: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM" as Difficulty,
    solution: "Using sliding window technique...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(m,n))",
    mainCategory: "ARRAY_STRING" as MainCategory,
    subCategories: ["SLIDING_WINDOW", "HASH_SET"] as SubCategory[],
  },
  {
    leetcodeId: "98",
    problemName: "Validate Binary Search Tree",
    difficulty: "MEDIUM" as Difficulty,
    solution: "Using inorder traversal...",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    mainCategory: "TREE" as MainCategory,
    subCategories: ["BINARY_SEARCH_TREE"] as SubCategory[],
  },
  {
    leetcodeId: "23",
    problemName: "Merge k Sorted Lists",
    difficulty: "HARD" as Difficulty,
    solution: "Using priority queue...",
    timeComplexity: "O(N log k)",
    spaceComplexity: "O(k)",
    mainCategory: "LINKED" as MainCategory,
    subCategories: ["PRIORITY_QUEUE", "SINGLY_LINKED"] as SubCategory[],
  },
  {
    leetcodeId: "127",
    problemName: "Word Ladder",
    difficulty: "HARD" as Difficulty,
    solution: "Using BFS with word pattern matching...",
    timeComplexity: "O(N * 26 * L)",
    spaceComplexity: "O(N)",
    mainCategory: "GRAPH" as MainCategory,
    subCategories: ["BFS"] as SubCategory[],
  },
  {
    leetcodeId: "212",
    problemName: "Word Search II",
    difficulty: "HARD" as Difficulty,
    solution: "Using Trie and backtracking...",
    timeComplexity: "O(M * N * 4^L)",
    spaceComplexity: "O(N)",
    mainCategory: "TREE" as MainCategory,
    subCategories: ["TRIE", "MATRIX"] as SubCategory[],
  }
]

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

  // Create problems for the user
  for (const problem of sampleProblems) {
    await prisma.user_problems.create({
      data: {
        id: `prob_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        leetcodeId: problem.leetcodeId,
        problemName: problem.problemName,
        difficulty: problem.difficulty,
        solution: problem.solution,
        timeComplexity: problem.timeComplexity,
        spaceComplexity: problem.spaceComplexity,
        mainCategory: problem.mainCategory,
        subCategories: problem.subCategories,
        solvedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      },
    })
  }

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
  console.log(`- Created ${problems.length} problems`)
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