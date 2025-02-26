'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  displayName: string | null
  email: string
  photoURL: string | null
  friendshipId?: string
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface FriendSearchProps {
  getToken: () => Promise<string | undefined>
  onFriendStatusChange: () => Promise<void>
  friends: Array<{id: string, friendshipId: string}>
}

export function FriendSearch({ getToken, onFriendStatusChange, friends }: FriendSearchProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a name or email to search",
        variant: "destructive"
      })
      return
    }
    
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
      setError(null)
    } catch (err) {
      setError('Error searching for users')
      console.error('Search error:', err)
      toast({
        title: "Search failed",
        description: "Could not complete the search. Please try again.",
        variant: "destructive"
      })
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

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully"
      })

      // Notify parent component to refresh data
      await onFriendStatusChange()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending friend request'
      setError(errorMessage)
      console.error('Friend request error:', err)
      toast({
        title: "Request failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const removeFriend = async (friendshipId: string) => {
    try {
      if (!friendshipId) {
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
        body: JSON.stringify({ friendshipId })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to remove friend')
      }

      // Update UI
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.friendshipId === friendshipId
            ? { ...user, friendshipId: undefined, friendshipStatus: 'NONE' }
            : user
        )
      )

      toast({
        title: "Friend removed",
        description: "Successfully removed friend",
      })

      // Notify parent component to refresh data
      await onFriendStatusChange()
    } catch (err) {
      console.error('Friend removal error:', err)
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive"
      })
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

  return (
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
        ) : searchResults.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          ) : null
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
} 