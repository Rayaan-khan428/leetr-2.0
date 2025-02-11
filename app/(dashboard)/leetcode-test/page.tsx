'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

// Update Chrome type declaration
declare global {
  interface Window {
    chrome?: {
      runtime: {
        sendMessage: (extensionId: string, message: any) => Promise<any>
      }
    }
  }
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
}

interface UserProfile {
  username: string
  ranking: number
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  acceptanceRate: number
  submissionCalendar: Record<string, number>
}

// Update the table columns to match the new data structure
const columns = [
  { header: 'Title', key: 'title' },
  { header: 'Difficulty', key: 'difficulty' },
  { header: 'Status', key: 'status' },
  { header: 'Language', key: 'language' },
  { header: 'Runtime', key: 'runtime' },
  { header: 'Memory', key: 'memory' },
  { header: 'Attempts', key: 'attempts' },
  { header: 'Last Submitted', key: 'lastSubmittedAt' },
]

export default function LeetCodeTestPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')

  const fetchLeetCodeData = async () => {
    if (!username) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if Chrome and the extension are available
      if (typeof window === 'undefined' || !window.chrome || !window.chrome.runtime) {
        throw new Error('Please use Chrome browser and install the Leetr extension')
      }

      // Test extension connection
      try {
        await window.chrome.runtime.sendMessage('aenfmeiihdccenofcogcigelmlmmcipb', { type: 'PING' })
      } catch (error: unknown) {
        // If we get an error about not being able to connect to the extension
        if (error instanceof Error && error.message.includes('Could not establish connection')) {
          throw new Error('Leetr extension not found. Please install it from the Chrome Web Store.')
        }
        // For other errors, we assume the extension is installed but there's a different issue
        throw error
      }

      const response = await window.chrome.runtime.sendMessage('aenfmeiihdccenofcogcigelmlmmcipb', { type: 'GET_LEETCODE_COOKIE' })
      if (!response?.cookie?.value) {
        throw new Error('Please log in to LeetCode first')
      }

      // Make the API request with the LeetCode session
      const leetcodeResponse = await fetch(`/api/leetcode/user/${username}`, {
        headers: {
          'X-Leetcode-Session': response.cookie.value
        }
      })

      if (!leetcodeResponse.ok) {
        const errorData = await leetcodeResponse.json()
        throw new Error(errorData.error || 'Failed to fetch LeetCode data')
      }
      
      const data = await leetcodeResponse.json()
      setProblems(data.problems || [])
      setUserProfile(data.userProfile || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>LeetCode API Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a LeetCode username to fetch their data
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter LeetCode username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="max-w-sm"
            />
            <Button 
              onClick={fetchLeetCodeData}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Data
            </Button>
          </div>
          
          {error && (
            <p className="text-red-500 mt-4">{error}</p>
          )}
        </CardContent>
      </Card>

      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Total Solved</h3>
                <p className="text-2xl font-bold">{userProfile.totalSolved}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Ranking</h3>
                <p className="text-2xl font-bold">#{userProfile.ranking}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Acceptance Rate</h3>
                <p className="text-2xl font-bold">{userProfile.acceptanceRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-green-500 font-bold">{userProfile.easySolved}</p>
                <p className="text-sm text-muted-foreground">Easy</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-500 font-bold">{userProfile.mediumSolved}</p>
                <p className="text-sm text-muted-foreground">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-red-500 font-bold">{userProfile.hardSolved}</p>
                <p className="text-sm text-muted-foreground">Hard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {problems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Solved Problems</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {problems.length} problems
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key}>{column.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell>
                        <a 
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {problem.title}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>{problem.status}</TableCell>
                      <TableCell>{problem.language}</TableCell>
                      <TableCell>{problem.runtime}ms</TableCell>
                      <TableCell>{problem.memory}MB</TableCell>
                      <TableCell>
                        <span className="font-medium">{problem.attempts}</span>
                      </TableCell>
                      <TableCell>{formatDate(problem.lastSubmittedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 