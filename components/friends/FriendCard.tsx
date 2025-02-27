'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { toast } from '@/hooks/use-toast'

interface FriendCardProps {
  friend: {
    friendshipId: string
    id: string
    displayName: string | null
    email: string
    photoURL: string | null
    problemStats: {
      totalProblems: number
      easy: number
      medium: number
      hard: number
      recentlySolved: number
      categories?: Record<string, number>
    }
    user_statistics?: {
      streak: number
      totalSolved: number
      lastSolved: Date | null
    }
  }
  getToken: () => Promise<string | undefined>
  onFriendRemoved: () => Promise<void>
}

export function FriendCard({ friend, getToken, onFriendRemoved }: FriendCardProps) {
  const removeFriend = async () => {
    try {
      if (!friend.friendshipId) {
        console.error('No friendshipId provided')
        return
      }

      const token = await getToken()
      
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendshipId: friend.friendshipId })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to remove friend')
      }

      toast({
        title: "Friend removed",
        description: "Successfully removed friend",
      })

      // Notify parent component
      await onFriendRemoved()
    } catch (err) {
      console.error('Friend removal error:', err)
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex flex-col space-y-4">
        {/* Friend Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={friend.photoURL || undefined} />
              <AvatarFallback>
                {friend.displayName?.[0]?.toUpperCase() || friend.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium">
                {friend.displayName || 'Anonymous User'}
              </p>
              <p className="text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={removeFriend}
            className="ml-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <span className="mr-2">❌</span>
            Remove Friend
          </Button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Radar Chart */}
          <div className="h-[300px] w-full bg-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                outerRadius={90} 
                data={[
                  {
                    subject: 'Easy',
                    value: (friend.problemStats.easy / Math.max(1, friend.problemStats.totalProblems)) * 100 || 0,
                  },
                  {
                    subject: 'Medium',
                    value: (friend.problemStats.medium / Math.max(1, friend.problemStats.totalProblems)) * 100 || 0,
                  },
                  {
                    subject: 'Hard',
                    value: (friend.problemStats.hard / Math.max(1, friend.problemStats.totalProblems)) * 100 || 0,
                  },
                  {
                    subject: 'Recent',
                    value: (friend.problemStats.recentlySolved / Math.max(1, friend.problemStats.totalProblems)) * 100 || 0,
                  },
                  {
                    subject: 'Total',
                    value: (friend.problemStats.totalProblems / 2000) * 100 || 0,
                  },
                ]}
              >
                <PolarGrid 
                  gridType="polygon"
                  stroke="hsl(var(--muted-foreground))" 
                  strokeOpacity={0.2}
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Difficulty Distribution Bar Chart */}
          <div className="h-[300px] w-full bg-card rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Easy', value: friend.problemStats.easy },
                  { name: 'Medium', value: friend.problemStats.medium },
                  { name: 'Hard', value: friend.problemStats.hard },
                ]}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis 
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.2 }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.2 }}
                />
                <CartesianGrid 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeOpacity={0.1} 
                  vertical={false}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  isAnimationActive={false}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Solved</p>
            <p className="text-2xl font-bold">{friend.problemStats.totalProblems}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Last 7 Days</p>
            <p className="text-2xl font-bold">{friend.problemStats.recentlySolved}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold">{friend.user_statistics?.streak || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Hard Problems</p>
            <p className="text-2xl font-bold">{friend.problemStats.hard}</p>
          </Card>
        </div>
      </div>
    </Card>
  )
} 