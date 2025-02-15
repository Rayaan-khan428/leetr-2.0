import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, BarChart as BarChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Problem } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ReviewScheduleProps {
  problems: Problem[]
  setSearchQuery: (query: string) => void
}

export function ReviewSchedule({ problems, setSearchQuery }: ReviewScheduleProps) {
  const [view, setView] = useState<'calendar' | 'chart'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })

  // Calendar View Logic
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const problemsByDate = problems.reduce((acc, problem) => {
    if (problem.nextReview) {
      const date = format(new Date(problem.nextReview), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(problem)
    }
    return acc
  }, {} as Record<string, Problem[]>)

  // Chart View Logic
  const getDays = (start: Date) => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(start, i)
      return format(date, 'yyyy-MM-dd')
    })
  }

  const days = getDays(startDate)
  const reviewData = days.map(date => {
    const problemsForDay = problems.filter(problem => {
      if (!problem.nextReview) return false
      const reviewDate = new Date(problem.nextReview)
      reviewDate.setHours(0, 0, 0, 0)
      const targetDate = new Date(date)
      return format(reviewDate, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd')
    })

    return {
      date,
      formattedDate: format(new Date(date), 'MMM d'),
      easy: problemsForDay.filter(p => p.difficulty === 'EASY').length,
      medium: problemsForDay.filter(p => p.difficulty === 'MEDIUM').length,
      hard: problemsForDay.filter(p => p.difficulty === 'HARD').length,
      total: problemsForDay.length
    }
  })

  // Shared handlers
  const handleProblemClick = (problemName: string) => {
    setSearchQuery(problemName)
    const problemsTable = document.querySelector('#problems-table')
    if (problemsTable) {
      problemsTable.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Chart navigation handlers
  const handlePrevious = () => {
    if (view === 'calendar') {
      setCurrentMonth(prev => subMonths(prev, 1))
    } else {
      setStartDate(date => {
        const newDate = addDays(date, -14)
        newDate.setHours(0, 0, 0, 0)
        return newDate
      })
    }
  }

  const handleNext = () => {
    if (view === 'calendar') {
      setCurrentMonth(prev => addMonths(prev, 1))
    } else {
      setStartDate(date => {
        const newDate = addDays(date, 14)
        newDate.setHours(0, 0, 0, 0)
        return newDate
      })
    }
  }

  const handleToday = () => {
    if (view === 'calendar') {
      setCurrentMonth(new Date())
    } else {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      setStartDate(now)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Review Schedule
          </CardTitle>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as 'calendar' | 'chart')}>
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <Calendar className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="chart" aria-label="Chart view">
                <BarChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {view === 'calendar' 
            ? format(currentMonth, 'MMMM yyyy')
            : `${format(new Date(days[0]), 'MMM d, yyyy')} - ${format(new Date(days[13]), 'MMM d, yyyy')}`
          }
        </p>
      </CardHeader>
      <CardContent>
        {view === 'calendar' ? (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayProblems = problemsByDate[dateStr] || []
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, currentMonth)

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      'min-h-[80px] p-1 border rounded-md',
                      isCurrentMonth ? 'bg-card' : 'bg-muted/50',
                      isToday && 'border-primary',
                      !isCurrentMonth && 'opacity-50'
                    )}
                  >
                    <div className="text-right text-sm mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayProblems.map((problem) => (
                        <TooltipProvider key={problem.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => handleProblemClick(problem.problemName)}
                                className={cn(
                                  'text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity',
                                  problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                  problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                )}
                              >
                                {problem.problemName}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{problem.problemName}</div>
                                <div className="text-muted-foreground">Review scheduled for {format(new Date(problem.nextReview!), 'MMM d, yyyy')}</div>
                                <div className="text-muted-foreground mt-1 italic">Click to find in table</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={reviewData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickMargin={20}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium">
                              {data.formattedDate}
                            </p>
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              {data.easy > 0 && (
                                <p className="text-green-800 dark:text-green-300">
                                  {data.easy} Easy
                                </p>
                              )}
                              {data.medium > 0 && (
                                <p className="text-yellow-800 dark:text-yellow-300">
                                  {data.medium} Medium
                                </p>
                              )}
                              {data.hard > 0 && (
                                <p className="text-red-800 dark:text-red-300">
                                  {data.hard} Hard
                                </p>
                              )}
                              <p className="font-medium pt-1 border-t">
                                {data.total} Total
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="easy" 
                    stackId="a"
                    fill="rgb(22 163 74)" // green-600
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar 
                    dataKey="medium" 
                    stackId="a"
                    fill="rgb(202 138 4)" // yellow-600
                    radius={[0, 0, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar 
                    dataKey="hard" 
                    stackId="a"
                    fill="rgb(220 38 38)" // red-600
                    radius={[0, 0, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded" />
                <span className="text-sm text-green-800 dark:text-green-300">Easy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded" />
                <span className="text-sm text-yellow-800 dark:text-yellow-300">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded" />
                <span className="text-sm text-red-800 dark:text-red-300">Hard</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 