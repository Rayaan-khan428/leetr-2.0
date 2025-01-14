import { PrismaClient, Difficulty } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Mock data templates
const mockProblems = [
  {
    leetcodeId: 'two-sum',
    problemName: 'Two Sum',
    difficulty: 'EASY',
    solution: 'function twoSum(nums: number[], target: number): number[] {\n    const map = new Map();\n    \n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}',
    notes: 'Use a hash map to store complements. This gives us O(n) time complexity by trading space for time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    url: 'https://leetcode.com/problems/two-sum'
  },
  {
    leetcodeId: 'add-two-numbers',
    problemName: 'Add Two Numbers',
    difficulty: 'MEDIUM',
    solution: 'function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n    const dummy = new ListNode(0);\n    let curr = dummy;\n    let carry = 0;\n    \n    while (l1 || l2 || carry) {\n        const sum = (l1?.val || 0) + (l2?.val || 0) + carry;\n        carry = Math.floor(sum / 10);\n        curr.next = new ListNode(sum % 10);\n        curr = curr.next;\n        l1 = l1?.next;\n        l2 = l2?.next;\n    }\n    \n    return dummy.next;\n}',
    notes: 'Remember to handle carry and different length linked lists. Edge cases include when one list is empty.',
    timeComplexity: 'O(max(n,m))',
    spaceComplexity: 'O(max(n,m))',
    url: 'https://leetcode.com/problems/add-two-numbers'
  },
  {
    leetcodeId: 'median-of-two-sorted-arrays',
    problemName: 'Median of Two Sorted Arrays',
    difficulty: 'HARD',
    solution: 'function findMedianSortedArrays(nums1: number[], nums2: number[]): number {\n    if (nums1.length > nums2.length) {\n        [nums1, nums2] = [nums2, nums1];\n    }\n    \n    const m = nums1.length;\n    const n = nums2.length;\n    let left = 0;\n    let right = m;\n    \n    while (left <= right) {\n        const partitionX = Math.floor((left + right) / 2);\n        const partitionY = Math.floor((m + n + 1) / 2) - partitionX;\n        \n        const maxLeftX = partitionX === 0 ? -Infinity : nums1[partitionX - 1];\n        const minRightX = partitionX === m ? Infinity : nums1[partitionX];\n        const maxLeftY = partitionY === 0 ? -Infinity : nums2[partitionY - 1];\n        const minRightY = partitionY === n ? Infinity : nums2[partitionY];\n        \n        if (maxLeftX <= minRightY && maxLeftY <= minRightX) {\n            if ((m + n) % 2 === 0) {\n                return (Math.max(maxLeftX, maxLeftY) + Math.min(minRightX, minRightY)) / 2;\n            } else {\n                return Math.max(maxLeftX, maxLeftY);\n            }\n        } else if (maxLeftX > minRightY) {\n            right = partitionX - 1;\n        } else {\n            left = partitionX + 1;\n        }\n    }\n    throw new Error("Input arrays are not sorted");\n}',
    notes: 'Binary search approach on the smaller array. Key insight is to find the correct partition point that maintains the median property.',
    timeComplexity: 'O(log(min(n,m)))',
    spaceComplexity: 'O(1)',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays'
  }
]

// Helper function to generate a random date within the last 6 months
function getRandomDate() {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000))
  return new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()))
}

// Helper function to generate random number of attempts (mostly 1, sometimes more)
function getRandomAttempts() {
  const rand = Math.random()
  if (rand > 0.8) return Math.floor(Math.random() * 3) + 2 // 20% chance of multiple attempts
  return 1
}

async function main() {
  try {
    // Retrieve the existing test user
    const testUser = await prisma.users.findUnique({
      where: {
        email: 'rayaan1516@gmail.com',
      },
    })

    if (!testUser) {
      throw new Error('Test user not found')
    }

    console.log('Retrieved test user:', testUser.email)

    // Now create multiple problems for the test user
    for (const problem of mockProblems) {
      // Create 3 variations of each problem with different dates
      for (let i = 0; i < 3; i++) {
        const uniqueLeetcodeId = `${problem.leetcodeId}-${i + 1}`
        await prisma.user_problems.create({
          data: {
            id: uuidv4(),
            userId: testUser.id,
            leetcodeId: uniqueLeetcodeId,
            problemName: `${problem.problemName} ${i + 1}`,
            difficulty: problem.difficulty as Difficulty,
            solution: problem.solution,
            notes: problem.notes,
            solvedAt: getRandomDate(),
            attempts: getRandomAttempts(),
            timeComplexity: problem.timeComplexity,
            spaceComplexity: problem.spaceComplexity,
            url: `${problem.url}-${i + 1}`,
            updatedAt: new Date()
          }
        })
      }
    }

    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })