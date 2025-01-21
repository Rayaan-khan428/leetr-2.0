'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Tooltip,
  Legend
} from 'recharts'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

interface User {
  id: string
  displayName: string | null
  email: string
  photoURL: string | null
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface Friend {
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
    }
}

interface FriendRequest {
  id: string
  status: string
  sender: {
    id: string
    displayName: string | null
    email: string
    photoURL: string | null
  }
  receiver: {
    id: string
    displayName: string | null
    email: string
    photoURL: string | null
  }
}

interface LeaderboardEntry {
  id: string
  displayName: string | null
  email: string
  photoURL: string | null
  stats: {
    totalSolved: number
    streak: number
    lastActive: Date
    consistency: number // percentage based on daily activity
  }
}

/**
 * Friends Page Component
 * @description Displays the user's friends list and friend requests
 * @returns {JSX.Element} The rendered friends page
 */
export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [isLoadingFriends, setIsLoadingFriends] = useState(false)
    const [activeTab, setActiveTab] = useState('search')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { getToken } = useAuth()
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Fetch friend requests when the component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchFriendRequests()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends()
    }
  }, [activeTab])

  useEffect(() => {
    const initializeAndFetchLeaderboard = async () => {
      try {
        const token = await getToken()
        
        // Initialize statistics first
        await fetch('/api/statistics/init', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        // Then fetch leaderboard
        const response = await fetch('/api/statistics', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }

        const data = await response.json()
        setLeaderboard(data)
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError('Error fetching leaderboard data')
      }
    }

    initializeAndFetchLeaderboard()
  }, []) // Fetch once when component mounts

  useEffect(() => {
    if (isSearchOpen) {
      fetchFriendRequests()
    }
  }, [isSearchOpen])

  const fetchFriends = async () => {
    setIsLoadingFriends(true)
    try {
      const token = await getToken()
      const response = await fetch('/api/friends', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        throw new Error('Failed to fetch friends')
      }
  
      const data = await response.json()
      setFriends(data)
    } catch (err) {
      setError('Error fetching friends')
      console.error('Friends fetch error:', err)
    } finally {
      setIsLoadingFriends(false)
    }
  }
  
  const removeFriend = async (friendshipId: string) => {
    try {
      const token = await getToken()
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendshipId })
      })
  
      if (!response.ok) {
        throw new Error('Failed to remove friend')
      }
  
      setFriends(prevFriends => 
        prevFriends.filter(friend => friend.friendshipId !== friendshipId)
      )
    } catch (err) {
      setError('Error removing friend')
      console.error('Friend removal error:', err)
    }
  }

  const fetchFriendRequests = async () => {
    try {
      const token = await getToken()
      const response = await fetch('/api/friends/requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch friend requests')
      }

      const data = await response.json()
      setFriendRequests(data)
    } catch (err) {
      setError('Error fetching friend requests')
      console.error('Friend requests error:', err)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to search users')
      }

      const data = await response.json()
      setSearchResults(data)
      setError('')
    } catch (err) {
      setError('Error searching for users')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      const token = await getToken()
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId: userId })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send friend request')
      }

      // Update UI to show pending status
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'PENDING' }
            : user
        )
      )

      // Show success message
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending friend request'
      setError(errorMessage)
      console.error('Friend request error:', err)
    }
  }

  const handleFriendRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      console.log(`Attempting to ${action.toLowerCase()} friend request:`, requestId)
      
      const token = await getToken()
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action })
      })

      const responseData = await response.json()
      console.log('Response from server:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${action.toLowerCase()} friend request`)
      }

      // Refresh friend requests list
      console.log('Request processed successfully, refreshing list')
      fetchFriendRequests()
    } catch (err) {
      const errorMessage = `Error ${action.toLowerCase()}ing friend request`
      console.error(errorMessage, err)
      setError(errorMessage)
    }
  }

  const getFriendActionButton = (user: User) => {
    switch (user.friendshipStatus) {
      case 'NONE':
        return (
          <Button
            size="sm"
            onClick={() => sendFriendRequest(user.id)}
            className="ml-2"
          >
            <span className="mr-2">��</span>
            Add Friend
          </Button>
        )
      case 'PENDING':
        return (
          <Button size="sm" variant="outline" disabled className="ml-2">
            <span className="mr-2">⏳</span>
            Pending
          </Button>
        )
      case 'ACCEPTED':
        return (
          <Button size="sm" variant="outline" className="ml-2">
            <span className="mr-2">❌</span>
            Remove Friend
          </Button>
        )
      default:
        return null
    }
  }

  const renderFriendsTab = () => (
    <div className="space-y-6">
      {isLoadingFriends ? (
        // Loading skeletons
        [...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))
      ) : friends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          You haven't added any friends yet
        </div>
      ) : (
        friends.map((friend) => (
          <Card key={friend.friendshipId} className="p-4">
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
                  onClick={() => removeFriend(friend.friendshipId)}
                >
                  <span className="mr-2">❌</span>
                  Remove Friend
                </Button>
              </div>

              {/* Statistics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Radar Chart */}
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={[
                      {
                        subject: 'Easy',
                        A: (friend.problemStats.easy / friend.problemStats.totalProblems) * 100 || 0,
                      },
                      {
                        subject: 'Medium',
                        A: (friend.problemStats.medium / friend.problemStats.totalProblems) * 100 || 0,
                      },
                      {
                        subject: 'Hard',
                        A: (friend.problemStats.hard / friend.problemStats.totalProblems) * 100 || 0,
                      },
                      {
                        subject: 'Recent Activity',
                        A: (friend.problemStats.recentlySolved / friend.problemStats.totalProblems) * 100 || 0,
                      },
                      {
                        subject: 'Total Progress',
                        A: (friend.problemStats.totalProblems / 2000) * 100 || 0, // Assuming 2000 total possible problems
                      },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Problem Solving Profile"
                        dataKey="A"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { name: 'Easy', value: friend.problemStats.easy },
                      { name: 'Medium', value: friend.problemStats.medium },
                      { name: 'Hard', value: friend.problemStats.hard },
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        name="Problems Solved" 
                      />
                    </RechartsBarChart>
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
                  <p className="text-sm text-muted-foreground">Hard Problems</p>
                  <p className="text-2xl font-bold">{friend.problemStats.hard}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {((friend.problemStats.totalProblems / 2000) * 100).toFixed(1)}%
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )

  const renderSearchTab = () => (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search users by email or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <span className="mr-2">🔍</span>
          Search
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))
        ) : (
          searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>
                    {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">
                    {user.displayName || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {getFriendActionButton(user)}
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderSearchCollapsible = () => (
    <Collapsible
      open={isSearchOpen}
      onOpenChange={setIsSearchOpen}
      className="w-full space-y-2"
    >
      <div className="flex justify-end px-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="mr-2">��</span>
            Add Friends
            {friendRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {friendRequests.length}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <span className="mr-2">🔍</span>
              Search
            </TabsTrigger>
            <TabsTrigger value="requests">
              <span className="mr-2">⏳</span>
              Requests {friendRequests.length > 0 && (
                <span className="ml-2 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-4">
            {renderSearchTab()}
          </TabsContent>
          <TabsContent value="requests" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {friendRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending friend requests
                  </div>
                ) : (
                  friendRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={request.sender.photoURL || undefined} />
                          <AvatarFallback>
                            {request.sender.displayName?.[0]?.toUpperCase() || request.sender.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">
                            {request.sender.displayName || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFriendRequest(request.id, 'ACCEPTED')}
                        >
                          <span className="mr-2">✅</span>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFriendRequest(request.id, 'REJECTED')}
                        >
                          <span className="mr-2">❌</span>
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  )

  const renderLeaderboard = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg border mb-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {index === 0 && <span className="text-3xl block mb-2">🏆</span>}
                  {index === 1 && <span className="text-3xl block mb-2">🥈</span>}
                  {index === 2 && <span className="text-3xl block mb-2">🥉</span>}
                  {index > 2 && <span className="text-lg font-bold">{index + 1}</span>}
                </div>
                <Avatar>
                  <AvatarImage src={entry.photoURL || undefined} />
                  <AvatarFallback>
                    {entry.displayName?.[0]?.toUpperCase() || entry.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{entry.displayName || 'Anonymous User'}</p>
                  <p className="text-sm text-muted-foreground">{entry.stats.totalSolved} problems solved</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-3xl block mb-2">🔥</span>
                  <p className="text-sm font-medium">{entry.stats.streak}d</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl block mb-2">🎯</span>
                  <p className="text-sm font-medium">{entry.stats.consistency.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Consistency</p>
                </div>
              </div>
            </motion.div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )

  const renderProgressComparison = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          Weekly Progress Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            data={leaderboard.slice(0, 5)} // Top 5 friends
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 12 }}
              interval={0}
              tickFormatter={(value) => value?.split(' ')[0] || 'Anonymous'}
              stroke="#6b7280"
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#6b7280"
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '1rem',
              }}
            />
            <Bar 
              name="Problems Solved" 
              dataKey="stats.totalSolved" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              isAnimationActive={false}
            />
            <Bar 
              name="Current Streak" 
              dataKey="stats.streak" 
              fill="hsl(var(--secondary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              isAnimationActive={false}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

  const renderDetailedStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          Detailed Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: "⏱️",
              value: `${leaderboard[0]?.stats.consistency.toFixed(0)}%`,
              label: "Daily Activity Rate"
            },
            {
              icon: "🏆",
              value: Math.max(...leaderboard.map(e => e.stats.streak)),
              label: "Best Streak"
            },
            {
              icon: "👥",
              value: leaderboard.length,
              label: "Active Friends"
            },
            {
              icon: "🎯",
              value: (leaderboard.reduce((acc, curr) => acc + curr.stats.totalSolved, 0) / leaderboard.length).toFixed(0),
              label: "Avg. Problems/Friend"
            }
          ].map((stat, i) => (
            <Card key={i} className="p-4 transition-all hover:shadow-md">
              <div className="text-center space-y-2">
                <span className="text-2xl">{stat.icon}</span>
                <h3 className="text-xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderDifficultyDistribution = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          Problem Difficulty Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <RechartsPie
              dataKey="value"
              data={[
                { name: 'Easy', value: 30, fill: '#10b981' },
                { name: 'Medium', value: 45, fill: '#f59e0b' },
                { name: 'Hard', value: 25, fill: '#ef4444' },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
            />
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )

  const renderAchievements = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          Global Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <span className="text-3xl block mb-2">👑</span>
              <h3 className="text-xl font-bold">
                {leaderboard[0]?.displayName || 'No one yet'}
              </h3>
              <p className="text-sm text-muted-foreground">Most Problems Solved</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <span className="text-3xl block mb-2">🔥</span>
              <h3 className="text-xl font-bold">
                {leaderboard.reduce((max, entry) => 
                  entry.stats.streak > max ? entry.stats.streak : max, 0
                )}d
              </h3>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <span className="text-3xl block mb-2">🎯</span>
              <h3 className="text-xl font-bold">
                {leaderboard.reduce((max, entry) => 
                  entry.stats.consistency > max ? entry.stats.consistency : max, 0
                ).toFixed(0)}%
              </h3>
              <p className="text-sm text-muted-foreground">Highest Consistency</p>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Search and Friend Requests Section */}
      <div className="space-y-4">
        {renderSearchCollapsible()}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderLeaderboard()}
        <div className="space-y-6">
          {renderDetailedStats()}
          {renderDifficultyDistribution()}
        </div>
      </div>

      {/* Activity and Progress Section */}
      {renderProgressComparison()}

      {/* Achievements and Global Stats */}
      {renderAchievements()}

      {/* Friends List */}
      {friends.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
          {renderFriendsTab()}
        </div>
      )}
    </div>
  )
}