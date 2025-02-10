import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Problem } from '../types'

interface ReviewCalendarProps {
  problems: Problem[]
  setSearchQuery: (query: string) => void
}

export function ReviewCalendar({ problems, setSearchQuery }: ReviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get calendar days for current month
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  // Create a map of dates to problems
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

  const handleProblemClick = (problemName: string) => {
    setSearchQuery(problemName)
    // Scroll to the problems table
    const problemsTable = document.querySelector('#problems-table')
    if (problemsTable) {
      problemsTable.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Review Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
} 