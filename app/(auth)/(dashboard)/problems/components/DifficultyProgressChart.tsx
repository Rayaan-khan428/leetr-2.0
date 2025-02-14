import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Problem } from '../types'

interface DifficultyProgressChartProps {
  problems: Problem[]
}

export function DifficultyProgressChart({ problems }: DifficultyProgressChartProps) {
  // Get last 6 months
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: endOfMonth(new Date())
  })

  const data = months.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const problemsInMonth = problems.filter(p => {
      const solvedDate = new Date(p.solvedAt)
      return solvedDate >= monthStart && solvedDate <= monthEnd
    })

    return {
      month: format(month, 'MMM yyyy'),
      easy: problemsInMonth.filter(p => p.difficulty === 'EASY').length,
      medium: problemsInMonth.filter(p => p.difficulty === 'MEDIUM').length,
      hard: problemsInMonth.filter(p => p.difficulty === 'HARD').length
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Progress</CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of problems solved by difficulty level over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className={
                    value === 'easy' ? 'text-green-800 dark:text-green-300' :
                    value === 'medium' ? 'text-yellow-800 dark:text-yellow-300' :
                    'text-red-800 dark:text-red-300'
                  }>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )}
              />
              <RechartsTooltip
                cursor={{ stroke: 'hsl(var(--muted))' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, entry) => sum + (entry.value as number), 0)
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="text-sm space-y-1 mt-1">
                          {payload.map((entry) => (
                            <p
                              key={entry.dataKey}
                              className={
                                entry.dataKey === 'easy' ? 'text-green-800 dark:text-green-300' :
                                entry.dataKey === 'medium' ? 'text-yellow-800 dark:text-yellow-300' :
                                'text-red-800 dark:text-red-300'
                              }
                            >
                              {entry.value} {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}
                            </p>
                          ))}
                          <p className="font-medium pt-1 border-t">
                            {total} Total
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line 
                type="monotone" 
                dataKey="easy" 
                stroke="rgb(22 163 74)" 
                strokeWidth={2} 
                dot={{ fill: "rgb(22 163 74)", strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="medium" 
                stroke="rgb(202 138 4)" 
                strokeWidth={2} 
                dot={{ fill: "rgb(202 138 4)", strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="hard" 
                stroke="rgb(220 38 38)" 
                strokeWidth={2} 
                dot={{ fill: "rgb(220 38 38)", strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 