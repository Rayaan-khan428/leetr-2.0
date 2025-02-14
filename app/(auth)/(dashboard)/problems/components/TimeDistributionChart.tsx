import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts'
import { Problem } from '../types'

interface TimeDistributionChartProps {
  problems: Problem[]
}

export function TimeDistributionChart({ problems }: TimeDistributionChartProps) {
  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours()
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    return 'Night'
  }

  const timeDistribution = problems.reduce((acc, problem) => {
    const timeOfDay = getTimeOfDay(new Date(problem.solvedAt))
    acc[timeOfDay] = (acc[timeOfDay] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(timeDistribution).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#60a5fa', '#fbbf24', '#f87171', '#4b5563']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solving Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.value} problems ({Math.round(data.value / problems.length * 100)}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 