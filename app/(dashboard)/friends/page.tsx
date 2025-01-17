'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, UserPlus, UserMinus, Check, X, UserRound, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PolarRadiusAxis
} from 'recharts'

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

      if (!response.ok) {
        throw new Error('Failed to send friend request')
      }

      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'PENDING' }
            : user
        )
      )
    } catch (err) {
      setError('Error sending friend request')
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
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        )
      case 'PENDING':
        return (
          <Button size="sm" variant="outline" disabled className="ml-2">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Button>
        )
      case 'ACCEPTED':
        return (
          <Button size="sm" variant="outline" className="ml-2">
            <UserMinus className="h-4 w-4 mr-1" />
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
                  <UserMinus className="h-4 w-4 mr-1" />
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
                    <BarChart data={[
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by username or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="h-4 w-4 mr-1" />
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

  const renderRequestsTab = () => (
    <div className="space-y-4">
      {friendRequests
        .filter(request => request.status === 'PENDING')
        .map((request) => (
          <div
            key={request.id}
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
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFriendRequest(request.id, 'REJECTED')}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      {friendRequests.filter(request => request.status === 'PENDING').length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No pending friend requests
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="requests">
                <Clock className="h-4 w-4 mr-2" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="friends">
                <UserRound className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
            </TabsList>
            <TabsContent value="search" className="mt-4">
                {renderSearchTab()}
            </TabsContent>
            <TabsContent value="requests" className="mt-4">
                {renderRequestsTab()}
            </TabsContent>
            <TabsContent value="friends" className="mt-4">
                {renderFriendsTab()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}