'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Code, FileText, Search } from 'lucide-react'
import { ActivityHeatmap } from '../friends/components/ActivityHeatmap'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'
import type { Problem } from './types'
import { ReviewSchedule } from './components/ReviewSchedule'
import { DifficultyProgressChart } from './components/DifficultyProgressChart'

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
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
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
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
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

// Update the StatsCard component to be more mobile-friendly
const StatsCard = ({ 
  title, 
  value, 
  subtitle = null,
  icon: Icon = null 
}: { 
  title: string
  value: React.ReactNode
  subtitle?: React.ReactNode | null
  icon?: React.ElementType | null
}) => (
  <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border">
    <div className="flex items-start justify-between">
      {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />}
      <div className="space-y-1 sm:space-y-2">
        <div className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex items-baseline">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
          {subtitle && (
            <div className="ml-2 text-xs sm:text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { getToken, user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [activityData, setActivityData] = useState<Array<{ date: Date, count: number }>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // Wrap fetchProblems in useCallback
  const fetchProblems = useCallback(async () => {
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
  }, [getToken]) // Add getToken as a dependency

  // Fetch problems on component mount
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const token = await getToken()
        const response = await fetch('/api/statistics/activity', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch activity data')
        }

        const data = await response.json()
        // Convert string dates back to Date objects
        setActivityData(data.map((item: any) => ({
          date: new Date(item.date),
          count: item.count
        })))
      } catch (err) {
        console.error('Error fetching activity data:', err)
        setError('Error fetching activity data')
      }
    }

    fetchActivityData()
  }, []) // Fetch once when component mounts

  const handleSuccess = () => {
    setShowForm(false)
    fetchProblems()
  }

  const renderActivityHeatmap = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          Activity Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <ActivityHeatmap data={activityData} />
      </CardContent>
    </Card>
  )

  // Add this filter function
  const filteredProblems = problems.filter(problem => {
    const searchLower = searchQuery.toLowerCase()
    return (
      problem.problemName.toLowerCase().includes(searchLower) ||
      problem.difficulty.toLowerCase().includes(searchLower) ||
      problem.leetcodeId.toLowerCase().includes(searchLower) ||
      (problem.timeComplexity?.toLowerCase().includes(searchLower)) ||
      (problem.spaceComplexity?.toLowerCase().includes(searchLower))
    )
  })

  // Update pagination calculations to use filtered problems
  const totalPages = Math.ceil(filteredProblems.length / pageSize)
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Add handler for search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Add these pagination helper functions
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            LeetCode Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.displayName ? `Welcome back, ${user.displayName}` : 'Track your coding journey'}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto"
        >
          {showForm ? 'Close Form' : '+ Add New Problem'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Current Streak"
          value={streak}
          subtitle={
            <div className="flex items-center gap-2">
              <span>{getStreakEmoji(streak)}</span>
              <span className="text-xs">
                {streak === 0 
                  ? "Start solving!" 
                  : `${streak} day${streak === 1 ? '' : 's'}`}
              </span>
            </div>
          }
        />
        <StatsCard
          title="Total Problems"
          value={problems.length}
          subtitle="solved problems"
        />
        <StatsCard
          title="Last Solved"
          value={
            problems[0]?.solvedAt 
              ? formatDate(problems[0].solvedAt)
              : 'No problems yet'
          }
        />
        <StatsCard
          title="Difficulty Distribution"
          value={
            <div className="flex gap-3 text-sm">
              <span className="text-green-500 dark:text-green-400">
                {problems.filter(p => p.difficulty === 'EASY').length} Easy
              </span>
              <span className="text-yellow-500 dark:text-yellow-400">
                {problems.filter(p => p.difficulty === 'MEDIUM').length} Med
              </span>
              <span className="text-red-500 dark:text-red-400">
                {problems.filter(p => p.difficulty === 'HARD').length} Hard
              </span>
            </div>
          }
        />
      </div>

      {/* Activity Overview */}
      {renderActivityHeatmap()}

      {/* After the activity heatmap */}
      <DifficultyProgressChart problems={problems} />

      {/* Review Schedule */}
      <ReviewSchedule problems={problems} setSearchQuery={setSearchQuery} />

      {/* Form Section */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      )}

      {/* Problems Table */}
      <Card id="problems-table">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Problem History</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>
            
            {/* Add search input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems by name, difficulty, or complexity..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <p className="text-base sm:text-lg font-medium text-foreground">No problems solved yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Start tracking your LeetCode progress by adding your first solved problem
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="mt-4 w-full sm:w-auto"
              >
                Add Your First Problem
              </Button>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-base font-medium text-foreground">No matching problems found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-xs sm:text-sm">Problem Name</TableHead>
                      <TableHead className="font-semibold text-xs sm:text-sm">Difficulty</TableHead>
                      <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Solved At</TableHead>
                      <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Complexity</TableHead>
                      <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Next Review</TableHead>
                      <TableHead className="font-semibold text-xs sm:text-sm">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProblems.map((problem) => (
                      <TableRow 
                        key={problem.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <a 
                            href={problem.url || `https://leetcode.com/problems/${problem.leetcodeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {problem.problemName}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                          {formatDate(problem.solvedAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {problem.timeComplexity || problem.spaceComplexity ? (
                            <div className="flex items-center gap-2">
                              {problem.timeComplexity && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                                  T: {problem.timeComplexity}
                                </span>
                              )}
                              {problem.spaceComplexity && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">
                                  S: {problem.spaceComplexity}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                          {problem.nextReview ? (
                            <span className={`text-sm ${
                              new Date(problem.nextReview) <= new Date() 
                                ? 'text-red-500 dark:text-red-400 font-medium' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatDate(problem.nextReview)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
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

              {/* Add pagination controls */}
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredProblems.length)} of {filteredProblems.length} {searchQuery && `(filtered from ${problems.length})`} problems
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}