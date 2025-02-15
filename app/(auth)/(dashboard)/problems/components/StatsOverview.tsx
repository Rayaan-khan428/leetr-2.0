import { Card } from '@/components/ui/card'
import type { Problem } from '../types'

interface StatsCardProps {
  title: string
  value: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ElementType
  className?: string
}

const StatsCard = ({ 
  title, 
  value, 
  subtitle = null,
  icon: Icon,
  className
}: StatsCardProps) => (
  <div className={`bg-card p-4 rounded-lg shadow-sm border border-border ${className}`}>
    <div className="flex items-start justify-between">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {subtitle && (
            <div className="ml-2 text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  </div>
)

// Helper function to get streak emoji
const getStreakEmoji = (streak: number) => {
  if (streak === 0) return '🧊'
  if (streak < 3) return '🔥'
  if (streak < 7) return '🔥🔥'
  if (streak < 14) return '🔥🔥🔥'
  return '🔥🔥🔥👑'
}

interface StatsOverviewProps {
  problems: Problem[]
  streak: number
}

export function StatsOverview({ problems, streak }: StatsOverviewProps) {
  // Calculate problems due for review
  const problemsDueForReview = problems.filter(
    p => p.nextReview && new Date(p.nextReview) <= new Date()
  ).length

  // Calculate problems solved in last 7 days
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)
  const recentlySolved = problems.filter(
    p => new Date(p.solvedAt) >= last7Days
  ).length

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatsCard
        title="Current Streak"
        value={
          <div className="flex items-center gap-2">
            <span>{streak}</span>
            <span>{getStreakEmoji(streak)}</span>
          </div>
        }
        subtitle="days"
      />
      
      <StatsCard
        title="Total Problems Solved"
        value={problems.length}
        subtitle="problems completed"
      />

      <StatsCard
        title="Due for Review"
        value={problemsDueForReview}
        subtitle={problemsDueForReview === 1 ? "problem" : "problems"}
      />

      <StatsCard
        title="Recent Progress"
        value={recentlySolved}
        subtitle="last 7 days"
      />
    </div>
  )
} 