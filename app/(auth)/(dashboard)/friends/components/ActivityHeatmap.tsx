import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format, subDays, eachDayOfInterval } from "date-fns"

interface ActivityData {
  date: Date
  count: number
}

interface ActivityHeatmapProps {
  data: ActivityData[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Generate dates for the last year (similar to GitHub)
  const today = new Date()
  const yearAgo = subDays(today, 365)
  
  const dates = eachDayOfInterval({
    start: yearAgo,
    end: today,
  })

  // Create a map of date strings to counts
  const activityMap = new Map(
    data.map(item => [format(item.date, 'yyyy-MM-dd'), item.count])
  )

  // Helper function to get color based on activity count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count <= 2) return 'bg-green-100 dark:bg-green-900'
    if (count <= 4) return 'bg-green-300 dark:bg-green-700'
    if (count <= 6) return 'bg-green-500 dark:bg-green-500'
    return 'bg-green-700 dark:bg-green-300'
  }

  // Group dates by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  dates.forEach((date) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(date)
  })
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] flex flex-col gap-4 py-6">
        <div className="flex gap-1 justify-center">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const count = activityMap.get(dateStr) || 0
                
                return (
                  <TooltipProvider key={dateStr}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'w-[18px] h-[18px] rounded-sm hover:opacity-75 transition-opacity',
                            getColor(count)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {count} problems on {format(day, 'MMM d, yyyy')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-3 text-sm mt-2">
          <span className="text-muted-foreground">Less</span>
          <div className="flex gap-1">
            {[0, 2, 4, 6, 8].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-[18px] h-[18px] rounded-sm',
                  getColor(level)
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  )
} 