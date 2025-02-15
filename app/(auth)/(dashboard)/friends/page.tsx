'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/hooks/use-toast'
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { PhoneVerificationPrompt } from "@/components/friends/PhoneVerificationPrompt"

interface User {
  id: string
  displayName: string | null
  email: string
  photoURL: string | null
  friendshipId?: string
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface Friend {
    friendshipId: string
    id: string
    displayName: string | null
    email: string
    photoURL: string | null
    friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
    problemStats: {
      totalProblems: number
      easy: number
      medium: number
      hard: number
      recentlySolved: number
    }
    user_statistics?: {  // Match the database field name
      streak: number
      totalSolved: number
      lastSolved: Date | null
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
    lastWeekSolved: number
    lastMonthSolved: number
    consistency: number
  }
}

/**
 * Friends Page Component
 * @description Displays the user's friends list and friend requests
 * @returns {JSX.Element} The rendered friends page
 */
export default function FriendsPage() {
    const { getToken, user } = useAuth()
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [rankingMetric, setRankingMetric] = useState<string>('totalSolved')
    const [selectedFriendsForComparison, setSelectedFriendsForComparison] = useState<string[]>([])
    const [showPhonePrompt, setShowPhonePrompt] = useState(false)
    const [isLoadingFriends, setIsLoadingFriends] = useState(false)
    const [isLoadingRequests, setIsLoadingRequests] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('friends')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<User[]>([])

    const fetchFriends = useCallback(async () => {
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
        console.error('Error fetching friends:', err)
        setError('Error fetching friends')
      } finally {
        setIsLoadingFriends(false)
      }
    }, [getToken])

    const fetchFriendRequests = useCallback(async () => {
      setIsLoadingRequests(true)
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
        console.error('Error fetching friend requests:', err)
        setError('Error fetching friend requests')
      } finally {
        setIsLoadingRequests(false)
      }
    }, [getToken])

    // Fetch friend requests when the component mounts or tab changes
    useEffect(() => {
      if (activeTab === 'requests') {
        fetchFriendRequests()
      }
    }, [activeTab, fetchFriendRequests])

    useEffect(() => {
      if (activeTab === 'friends') {
        fetchFriends()
      }
    }, [activeTab, fetchFriends])

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
    }, [getToken])

    useEffect(() => {
      if (isSearchOpen) {
        fetchFriendRequests()
      }
    }, [isSearchOpen, fetchFriendRequests])

    useEffect(() => {
      fetchFriends()
    }, [fetchFriends])

    const removeFriend = async (friendshipId: string) => {
      console.log('Attempting to remove friend with friendshipId:', friendshipId)
      try {
        if (!friendshipId) {
          console.error('No friendshipId provided')
          // If no friendshipId but marked as friend, force refresh to sync with DB
          await refreshFriendData()
          return
        }

        const token = await getToken()
        console.log('Got auth token, making DELETE request to /api/friends')
        
        const response = await fetch('/api/friends', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ friendshipId })
        })

        console.log('Server response status:', response.status)
        const responseData = await response.json()
        console.log('Server response data:', responseData)

        if (!response.ok) {
          if (response.status === 404) {
            // Friendship already removed, refresh data to sync
            console.log('Friendship not found, refreshing data')
            await refreshFriendData()
            return
          }
          throw new Error(responseData.error || 'Failed to remove friend')
        }

        console.log('Successfully removed friend, updating UI')
        await refreshFriendData() // This will update both users' views

        toast({
          title: "Friend removed",
          description: "Successfully removed friend",
        })
      } catch (err) {
        console.error('Detailed friend removal error:', err)
        console.error('Error state:', {
          friendshipId,
          friends: friends.map(f => ({ id: f.id, friendshipId: f.friendshipId }))
        })
        setError('Error removing friend')
        
        // Refresh data anyway to ensure UI is in sync
        await refreshFriendData()
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
        
        // Map search results to include friendship status from friends list
        const resultsWithStatus = data.map((user: User) => {
          const existingFriend = friends.find(f => f.id === user.id)
          return {
            ...user,
            friendshipId: existingFriend?.friendshipId,
            friendshipStatus: existingFriend ? 'ACCEPTED' : 'NONE'
          }
        })

        setSearchResults(resultsWithStatus)
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

        // If user hasn't verified phone and this is their first friend request
        if (!user?.phoneVerified && friends.length === 0) {
          setShowPhonePrompt(true)
        }

        await refreshFriendData()
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
        await refreshFriendData()
      } catch (err) {
        const errorMessage = `Error ${action.toLowerCase()}ing friend request`
        console.error(errorMessage, err)
        setError(errorMessage)
      }
    }

    const getFriendActionButton = (user: User) => {
      console.log('Getting friend action button for user:', user)
      
      // If marked as accepted but no friendshipId, force refresh
      if (user.friendshipStatus === 'ACCEPTED' && !user.friendshipId) {
        refreshFriendData()
        return null
      }

      switch (user.friendshipStatus) {
        case 'NONE':
          return (
            <Button
              size="sm"
              onClick={() => sendFriendRequest(user.id)}
              className="ml-2"
            >
              <span className="mr-2">👋</span>
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
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => removeFriend(user.friendshipId!)}
              className="ml-2 hover:bg-destructive hover:text-destructive-foreground"
            >
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
                  {getFriendActionButton(friend)}
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
                            value: (friend.problemStats.easy / friend.problemStats.totalProblems) * 100 || 0,
                          },
                          {
                            subject: 'Medium',
                            value: (friend.problemStats.medium / friend.problemStats.totalProblems) * 100 || 0,
                          },
                          {
                            subject: 'Hard',
                            value: (friend.problemStats.hard / friend.problemStats.totalProblems) * 100 || 0,
                          },
                          {
                            subject: 'Recent',
                            value: (friend.problemStats.recentlySolved / friend.problemStats.totalProblems) * 100 || 0,
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

                  {/* Bar Chart */}
                  <div className="h-[300px] w-full bg-card rounded-lg p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart 
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
            className="h-11"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            size="lg"
          >
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
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-xl">🔍</span>
              Friends
              {friendRequests.length > 0 && (
                <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  {friendRequests.length} new {friendRequests.length === 1 ? 'request' : 'requests'}
                </span>
              )}
            </h2>
            
            {!isSearchOpen && (
              <div className="flex -space-x-2">
                {friends.length > 0 ? (
                  <>
                    {friends.slice(0, 5).map((friend) => (
                      <TooltipProvider key={friend.friendshipId}>
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={friend.photoURL || undefined} />
                              <AvatarFallback className="text-xs">
                                {friend.displayName?.[0] || friend.email[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{friend.displayName || 'Anonymous'}</p>
                          </TooltipContent>
                        </UiTooltip>
                      </TooltipProvider>
                    ))}
                    {friends.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm border-2 border-background">
                        +{friends.length - 5}
                      </div>
                    )}
                  </>
                ) : (
                  // Empty placeholders
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center"
                      >
                        <span className="text-xs text-muted-foreground">?</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button 
              size="lg" 
              variant={isSearchOpen ? "outline" : "default"}
              className="gap-2 h-10 px-4 py-2"
            >
              {isSearchOpen ? (
                <>
                  <span className="text-lg">✕</span>
                  Close
                </>
              ) : (
                <>
                  <span className="text-lg">👋</span>
                  Add Friends
                  {friendRequests.length > 0 && (
                    <span className="ml-1 rounded-full bg-background w-5 h-5 text-xs flex items-center justify-center text-foreground">
                      {friendRequests.length}
                    </span>
                  )}
                </>
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

    const getRankingMetricValue = (entry: LeaderboardEntry) => {
      switch (rankingMetric) {
        case 'totalSolved':
          return entry.stats.totalSolved || 0
        case 'streak':
          return entry.stats.streak || 0
        case 'lastWeek':
          return entry.stats.lastWeekSolved || 0
        case 'lastMonth':
          return entry.stats.lastMonthSolved || 0
        case 'consistency':
          return entry.stats.consistency || 0
        default:
          return entry.stats.totalSolved || 0
      }
    }

    const renderLeaderboard = () => (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Leaderboard
            </CardTitle>
            <Select value={rankingMetric} onValueChange={setRankingMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ranking Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalSolved">Total Solved</SelectItem>
                <SelectItem value="streak">Current Streak</SelectItem>
                <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {[...leaderboard]
              .sort((a, b) => getRankingMetricValue(b) - getRankingMetricValue(a))
              .map((entry, index) => {
                const isCurrentUser = entry.id === user?.id;
                const metricValue = getRankingMetricValue(entry);
                const metricDisplay = rankingMetric === 'consistency' 
                  ? `${(metricValue || 0).toFixed(1)}%`
                  : (metricValue || 0).toString();

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border mb-2 ${
                      isCurrentUser ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <span className="text-3xl block mb-2">🏆</span>}
                        {index === 1 && <span className="text-3xl block mb-2">🥈</span>}
                        {index === 2 && <span className="text-3xl block mb-2">🥉</span>}
                        {index > 2 && <span className="text-lg font-bold">{index + 1}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={entry.photoURL || undefined} />
                          <AvatarFallback>
                            {entry.displayName?.[0]?.toUpperCase() || entry.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {isCurrentUser ? 'You' : (entry.displayName || 'Anonymous User')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {metricDisplay} {rankingMetric === 'streak' ? 'days' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    )

    const renderFriendComparison = () => {
      const selectedFriendsData = friends.filter(friend => 
        selectedFriendsForComparison.includes(friend.friendshipId)
      )

      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              Friend Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Select up to two friends to compare their statistics
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {/* Friend Selection */}
              <div className="flex flex-wrap gap-4">
                {friends.map(friend => (
                  <Button
                    key={friend.friendshipId}
                    variant={selectedFriendsForComparison.includes(friend.friendshipId) ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFriendsForComparison(prev => {
                        if (prev.includes(friend.friendshipId)) {
                          return prev.filter(id => id !== friend.friendshipId)
                        }
                        return [...prev.slice(-1), friend.friendshipId]
                      })
                    }}
                    disabled={selectedFriendsForComparison.length >= 2 && !selectedFriendsForComparison.includes(friend.friendshipId)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={friend.photoURL || undefined} />
                      <AvatarFallback className="text-xs">
                        {friend.displayName?.[0] || friend.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    {friend.displayName || 'Anonymous'}
                  </Button>
                ))}
              </div>

              {selectedFriendsData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedFriendsData.map(friend => (
                    <Card key={friend.friendshipId} className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={friend.photoURL || undefined} />
                            <AvatarFallback className="text-xl">
                              {friend.displayName?.[0] || friend.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold">{friend.displayName || 'Anonymous'}</h3>
                            <p className="text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Total Solved</h4>
                              <p className="text-2xl font-bold">{friend.problemStats.totalProblems}</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Streak</h4>
                              <p className="text-2xl font-bold">{friend.user_statistics?.streak || 0}d</p>
                            </Card>
                          </div>

                          <Card className="p-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-4">Difficulty Distribution</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span>Easy</span>
                                <div className="w-2/3 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${(friend.problemStats.easy / friend.problemStats.totalProblems * 100) || 0}%`
                                    }}
                                  />
                                </div>
                                <span className="w-12 text-right">{friend.problemStats.easy}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Medium</span>
                                <div className="w-2/3 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{
                                      width: `${(friend.problemStats.medium / friend.problemStats.totalProblems * 100) || 0}%`
                                    }}
                                  />
                                </div>
                                <span className="w-12 text-right">{friend.problemStats.medium}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Hard</span>
                                <div className="w-2/3 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{
                                      width: `${(friend.problemStats.hard / friend.problemStats.totalProblems * 100) || 0}%`
                                    }}
                                  />
                                </div>
                                <span className="w-12 text-right">{friend.problemStats.hard}</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {selectedFriendsData.length === 1 && (
                    <Card className="p-6 flex items-center justify-center border-dashed">
                      <div className="text-center text-muted-foreground">
                        <p>Select another friend to compare</p>
                        <p className="text-sm">or view single friend stats above</p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    const renderGlobalStats = () => {
      const longestStreakUser = leaderboard.reduce((max, entry) => 
        entry.stats.streak > (max?.stats.streak || 0) ? entry : max, 
        null as LeaderboardEntry | null
      );

      const mostConsistentUser = leaderboard.reduce((max, entry) => 
        entry.stats.consistency > (max?.stats.consistency || 0) ? entry : max,
        null as LeaderboardEntry | null
      );

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              Global Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center space-y-2">
                  <span className="text-3xl block">👑</span>
                  <h3 className="text-xl font-bold">
                    {leaderboard[0]?.stats.totalSolved || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Most Problems Solved</p>
                  <p className="text-xs text-muted-foreground">
                    by {leaderboard[0]?.displayName || 'Anonymous'}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center space-y-2">
                  <span className="text-3xl block">🔥</span>
                  <h3 className="text-xl font-bold">
                    {longestStreakUser?.stats.streak || 0}d
                  </h3>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-xs text-muted-foreground">
                    by {longestStreakUser?.displayName || 'Anonymous'}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center space-y-2">
                  <span className="text-3xl block">🎯</span>
                  <h3 className="text-xl font-bold">
                    {mostConsistentUser?.stats.consistency.toFixed(0) || 0}%
                  </h3>
                  <p className="text-sm text-muted-foreground">Highest Consistency</p>
                  <p className="text-xs text-muted-foreground">
                    by {mostConsistentUser?.displayName || 'Anonymous'}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center space-y-2">
                  <span className="text-3xl block">👥</span>
                  <h3 className="text-xl font-bold">
                    {leaderboard.length}
                  </h3>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-xs text-muted-foreground">
                    in the last 7 days
                  </p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )
    }

    const cleanupFriendData = async () => {
      try {
        const token = await getToken()
        const response = await fetch('/api/friends/cleanup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to cleanup friend data')
        }

        // Refresh the data after cleanup
        await refreshFriendData()
        
        toast({
          title: "Cleanup successful",
          description: "Friend data has been reset",
        })
      } catch (err) {
        console.error('Cleanup error:', err)
        setError('Failed to cleanup friend data')
      }
    }

    const renderWelcomeSection = () => {
      const hasNoFriends = friends.length === 0;    
      
      return (
        <div className="relative h-[300px] w-full rounded-lg border overflow-hidden">
          <BackgroundGradientAnimation
            gradientBackgroundStart="hsl(var(--background))"
            gradientBackgroundEnd="hsl(var(--background))"
            firstColor="18, 113, 255"
            secondColor="221, 74, 255"
            thirdColor="100, 220, 255"
            fourthColor="200, 50, 50"
            fifthColor="180, 180, 50"
            pointerColor="140, 100, 255"
            size="100%"
            blendingValue="hard-light"
            containerClassName="!h-[300px] !w-full rounded-lg"
            className="opacity-80"
          >
            {/* Content Container */}
            <div className="relative z-50 h-full p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    Welcome to the Community Hub! 👋
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Track your progress, compete with friends, and stay motivated in your coding journey.
                    {hasNoFriends ? (
                      <span className="block mt-2">
                        🤝 Get started by adding some friends to compare progress and compete together!
                      </span>
                    ) : (
                      <span className="block mt-2">
                        🎯 You have {friends.length} friend{friends.length !== 1 ? 's' : ''} on your coding journey.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </BackgroundGradientAnimation>
        </div>
      );
    };

    // Add this function to refresh all friend-related data
    const refreshFriendData = async () => {
      console.log('Refreshing friend data')
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests()
      ])
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Welcome Section */}
        {renderWelcomeSection()}
        
        {/* Search and Friend Requests Section */}
        <div className="space-y-4">
          {renderSearchCollapsible()}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Global Stats */}
        {renderGlobalStats()}

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6">
          {renderLeaderboard()}
          {renderFriendComparison()}
          
          {/* Friends List */}
          {friends.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
              {renderFriendsTab()}
            </div>
          )}
        </div>

        <PhoneVerificationPrompt 
          open={showPhonePrompt} 
          onClose={() => setShowPhonePrompt(false)} 
        />
      </div>
    )
  }