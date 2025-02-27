'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { toast } from '@/hooks/use-toast'

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

interface FriendRequestsProps {
  getToken: () => Promise<string | undefined>
  onRequestHandled: () => Promise<void>
}

export function FriendRequests({ getToken, onRequestHandled }: FriendRequestsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchFriendRequests = async () => {
    setIsLoading(true)
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
      setError(null)
    } catch (err) {
      console.error('Error fetching friend requests:', err)
      setError('Error fetching friend requests')
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFriendRequests()
  }, [])

  const handleFriendRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
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

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${action.toLowerCase()} friend request`)
      }

      // Update UI
      setFriendRequests(prev => prev.filter(request => request.id !== requestId))
      
      // Show success message
      toast({
        title: action === 'ACCEPTED' ? "Friend request accepted" : "Friend request rejected",
        description: action === 'ACCEPTED' 
          ? "You are now friends!" 
          : "Friend request has been rejected"
      })

      // Notify parent component
      await onRequestHandled()
    } catch (err) {
      const errorMessage = `Error ${action.toLowerCase()}ing friend request`
      console.error(errorMessage, err)
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  return (
    <ScrollArea className="h-[300px]">
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
        ) : friendRequests.length === 0 ? (
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
  )
} 