import { NextResponse } from 'next/server'
import { LeetCode, Credential } from 'leetcode-query'

interface AllQuestionsCount {
  difficulty: string
  count: number
}

interface MatchedUser {
  username: string
  profile: {
    ranking: number
  }
  submitStats: {
    acSubmissionNum: Array<{
      difficulty: string
      count: number
    }>
    totalSubmissionNum: Array<{
      difficulty: string
      count: number
    }>
  }
  submissionCalendar: string
}

interface Submission {
  id: number
  isPending: boolean
  lang: string
  memory: number
  runtime: number
  statusDisplay: string
  time: string
  timestamp: number
  title: string
  titleSlug: string
  url: string
}

interface Problem {
  id: number
  title: string
  titleSlug: string
  difficulty: string
  status: string
  lastSubmittedAt: string
  language: string
  runtime: number
  memory: number
  url: string
  attempts: number
  acceptanceRate: number
  topicTags: string[]
}

interface UserProfile {
  allQuestionsCount: AllQuestionsCount[]
  matchedUser: MatchedUser | null
}

async function fetchLeetCodeData(username: string, request: Request) {
  try {
    // Get the LEETCODE_SESSION from the X-Leetcode-Session header
    const leetcodeSession = request.headers.get('X-Leetcode-Session')

    if (!leetcodeSession) {
      throw new Error('LeetCode session not found. Please ensure the Chrome extension is installed and you are logged into LeetCode.')
    }

    // Initialize LeetCode client with authentication
    const credential = new Credential()
    await credential.init(leetcodeSession)
    const leetcode = new LeetCode(credential)
    
    // Get user profile data
    const userResponse = await leetcode.user(username) as UserProfile
    
    if (!userResponse || !userResponse.matchedUser) {
      throw new Error('User not found')
    }

    const { matchedUser } = userResponse

    if (!matchedUser.submitStats) {
      throw new Error('Invalid user data')
    }

    // Get all submissions (100 at a time)
    const allSubmissions: Submission[] = []
    let offset = 0
    const limit = 100
    
    while (true) {
      const submissions = await leetcode.submissions({
        offset,
        limit
      })
      if (!submissions || submissions.length === 0) break
      
      allSubmissions.push(...submissions)
      if (submissions.length < limit) break
      
      offset += limit
    }

    // Group submissions by problem
    const problemsMap = new Map<string, Problem>()
    
    allSubmissions.forEach(submission => {
      const key = submission.titleSlug
      const existing = problemsMap.get(key)
      
      if (existing) {
        // Update existing problem entry
        existing.attempts++
        if (new Date(submission.timestamp * 1000) > new Date(existing.lastSubmittedAt)) {
          existing.lastSubmittedAt = new Date(submission.timestamp * 1000).toISOString()
          existing.status = submission.statusDisplay
          existing.language = submission.lang
          existing.runtime = submission.runtime
          existing.memory = submission.memory
        }
      } else {
        // Create new problem entry
        problemsMap.set(key, {
          id: submission.id,
          title: submission.title,
          titleSlug: submission.titleSlug,
          difficulty: userResponse.allQuestionsCount.find(q => q.difficulty !== 'All')?.difficulty || 'Unknown',
          status: submission.statusDisplay,
          lastSubmittedAt: new Date(submission.timestamp * 1000).toISOString(),
          language: submission.lang,
          runtime: submission.runtime,
          memory: submission.memory,
          url: `https://leetcode.com${submission.url}`,
          attempts: 1,
          acceptanceRate: 0, // Will be calculated later
          topicTags: [] // Will be populated later if needed
        })
      }
    })

    // Format the data to match our existing interface
    const userProfile = {
      username: matchedUser.username,
      ranking: matchedUser.profile.ranking,
      totalSolved: matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'All')?.count || 0,
      easySolved: matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'Easy')?.count || 0,
      mediumSolved: matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'Medium')?.count || 0,
      hardSolved: matchedUser.submitStats.acSubmissionNum.find(s => s.difficulty === 'Hard')?.count || 0,
      acceptanceRate: (matchedUser.submitStats.acSubmissionNum[0].count / matchedUser.submitStats.totalSubmissionNum[0].count) * 100,
      submissionCalendar: matchedUser.submissionCalendar ? JSON.parse(matchedUser.submissionCalendar) : {}
    }

    return {
      userProfile,
      problems: Array.from(problemsMap.values())
    }
  } catch (error) {
    console.error('Error fetching LeetCode data:', error)
    throw error
  }
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const data = await fetchLeetCodeData(params.username, request)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Full error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch LeetCode data' },
      { status: 500 }
    )
  }
} 