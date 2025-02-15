'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Problem } from './types'
import { ReviewSchedule } from './components/ReviewSchedule'
import { DifficultyProgressChart } from './components/DifficultyProgressChart'
import { ProblemsTable } from './components/ProblemsTable'
import { StatsOverview } from './components/StatsOverview'
import { ProblemFilters } from './components/ProblemFilters'

export default function ProblemsPage() {
  const { getToken, user } = useAuth()
  const [state, setState] = useState({
    problems: [] as Problem[],
    error: '',
    loading: true,
    streak: 0,
    activityData: [] as Array<{ date: Date, count: number }>,
    currentPage: 1,
    pageSize: 10,
    searchQuery: ''
  })

  const calculateStreak = (problems: Problem[]) => {
    if (!problems.length) return 0;

    const sortedDates = problems
      .map(p => new Date(p.solvedAt).toISOString().split('T')[0])
      .sort((a, b) => b.localeCompare(a));

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      
      if (sortedDates[i] === previousDate.toISOString().split('T')[0]) {
        streak++;
        currentDate = previousDate;
      } else break;
    }

    return streak;
  };

  const fetchProblems = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')

      const response = await fetch('/api/problems', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const problems = await response.json()
      setState(prev => ({
        ...prev,
        problems,
        streak: calculateStreak(problems),
        loading: false
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch problems'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      console.error('Error fetching problems:', err)
    }
  }, [getToken])

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const token = await getToken()
        const response = await fetch('/api/statistics/activity', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) throw new Error('Failed to fetch activity data')

        const data = await response.json()
        setState(prev => ({
          ...prev,
          activityData: data.map((item: any) => ({
            date: new Date(item.date),
            count: item.count
          }))
        }))
      } catch (err) {
        console.error('Error fetching activity data:', err)
        setState(prev => ({ ...prev, error: 'Error fetching activity data' }))
      }
    }

    fetchActivityData()
  }, [getToken])

  const filteredProblems = state.problems.filter(problem => {
    const searchLower = state.searchQuery.toLowerCase()
    return (
      problem.problemName.toLowerCase().includes(searchLower) ||
      problem.difficulty.toLowerCase().includes(searchLower) ||
      problem.leetcodeId.toLowerCase().includes(searchLower) ||
      problem.timeComplexity?.toLowerCase().includes(searchLower) ||
      problem.spaceComplexity?.toLowerCase().includes(searchLower)
    )
  })

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          LeetCode Progress
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.displayName ? `Welcome back, ${user.displayName}` : 'Track your coding journey'}
        </p>
      </div>

      <StatsOverview problems={state.problems} streak={state.streak} />

      <div className="grid gap-6 md:grid-cols-2">
        <DifficultyProgressChart problems={state.problems} />
        <ReviewSchedule 
          problems={state.problems} 
          setSearchQuery={(query: string) => setState(prev => ({ ...prev, searchQuery: query }))} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <ProblemFilters
            searchQuery={state.searchQuery}
            onSearchChange={(query) => setState(prev => ({ ...prev, searchQuery: query }))}
            pageSize={state.pageSize}
            onPageSizeChange={(value) => {
              setState(prev => ({
                ...prev,
                pageSize: Number(value),
                currentPage: 1
              }))
            }}
            totalProblems={state.problems.length}
          />

          <ProblemsTable
            problems={state.problems}
            filteredProblems={filteredProblems}
            currentPage={state.currentPage}
            setCurrentPage={(page) => setState(prev => ({ ...prev, currentPage: page }))}
            pageSize={state.pageSize}
            searchQuery={state.searchQuery}
          />
        </CardContent>
      </Card>
    </div>
  )
}