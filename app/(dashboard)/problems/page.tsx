'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProblemForm from '@/components/problems/ProblemForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronRight, Code, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ComplexityBadge from './ComplexityBadge'

// Interface matching our Prisma schema for user_problems
interface Problem {
  id: string
  leetcodeId: string
  problemName: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  solvedAt: string
  timeComplexity?: string
  spaceComplexity?: string
  solution?: string
  notes?: string
  attempts?: number
  url?: string
  nextReview?: string
}

// Reusable component for expandable text fields (solution and notes)
const ExpandableText = ({ 
  text, 
  icon: Icon,
  label 
}: { 
  text?: string, 
  icon: React.ElementType,
  label: string 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!text) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <Icon size={16} />
        {label}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {text}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add this helper function at the top level
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Add this helper function at the top level after formatDate
const calculateStreak = (problems: Problem[]) => {
  if (problems.length === 0) return 0;

  const sortedDates = problems
    .map(p => new Date(p.solvedAt).toISOString().split('T')[0])
    .sort((a, b) => b.localeCompare(a)); // Sort desc

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check if the user solved a problem today or yesterday to maintain streak
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    if (sortedDates[i] === previousDate.toISOString().split('T')[0]) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  return streak;
};

// Add this helper function for the fire emojis
const getStreakEmoji = (streak: number) => {
  if (streak === 0) return '🧊';
  if (streak < 3) return '🔥';
  if (streak < 7) return '🔥🔥';
  if (streak < 14) return '🔥🔥🔥';
  return '🔥🔥🔥👑';
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { getToken, user } = useAuth()
  const [streak, setStreak] = useState(0)

  // Fetch problems from the API
  const fetchProblems = async () => {
    try {
      const token = await getToken()
      
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/problems', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setProblems(data)
      setStreak(calculateStreak(data))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch problems'
      setError(errorMessage)
      console.error('Error fetching problems:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch problems on component mount
  useEffect(() => {
    fetchProblems()
  }, [])

  const handleSuccess = () => {
    setShowForm(false)
    fetchProblems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Dashboard Welcome Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Your LeetCode Tracker
              {user?.displayName && `, ${user.displayName}`}
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress, analyze patterns, and improve your problem-solving skills.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700">Current Streak</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{streak}</p>
                  <span className="text-xl" title={`${streak} day streak`}>
                    {getStreakEmoji(streak)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {streak === 0 
                    ? "Solve a problem today to start a streak!" 
                    : `${streak} day${streak === 1 ? '' : 's'} and counting!`}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700">Total Problems</h3>
                <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700">Last Solved</h3>
                <p className="text-lg text-gray-600">
                  {problems[0]?.solvedAt ? 
                    formatDate(problems[0].solvedAt) : 
                    'No problems solved yet'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700">Difficulty Split</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-green-600 text-sm">
                    Easy: {problems.filter(p => p.difficulty === 'EASY').length}
                  </span>
                  <span className="text-yellow-600 text-sm">
                    Medium: {problems.filter(p => p.difficulty === 'MEDIUM').length}
                  </span>
                  <span className="text-red-600 text-sm">
                    Hard: {problems.filter(p => p.difficulty === 'HARD').length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Problems Management Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Problem History</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : 'Add Problem'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <div className="mb-8">
          <ProblemForm onSuccess={handleSuccess} />
        </div>
      )}

      {/* Problems Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solved Problems</CardTitle>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <p className="text-center text-gray-500">No problems solved yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Problem Name</TableHead>
                    <TableHead className="font-semibold">Difficulty</TableHead>
                    <TableHead className="font-semibold">Solved At</TableHead>
                    <TableHead className="font-semibold">Complexity</TableHead>
                    <TableHead className="font-semibold">Next Review</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow 
                      key={problem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <a 
                          href={problem.url || `https://leetcode.com/problems/${problem.leetcodeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {problem.problemName}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty}
                          {problem.attempts && problem.attempts > 1 && ` (${problem.attempts} attempts)`}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(problem.solvedAt)}</TableCell>
                      <TableCell>
                        {problem.timeComplexity || problem.spaceComplexity ? (
                          <div className="flex items-center gap-2">
                            {problem.timeComplexity && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                                T: {problem.timeComplexity}
                              </span>
                            )}
                            {problem.spaceComplexity && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                                S: {problem.spaceComplexity}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {problem.nextReview ? (
                          <span className={`text-sm ${
                            new Date(problem.nextReview) <= new Date() 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            {formatDate(problem.nextReview)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <ExpandableText 
                            text={problem.solution} 
                            icon={Code}
                            label="Solution"
                          />
                          <ExpandableText 
                            text={problem.notes} 
                            icon={FileText}
                            label="Notes"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}