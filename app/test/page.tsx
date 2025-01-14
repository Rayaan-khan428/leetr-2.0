'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'

export default function TestAuth() {
  const { user, signin, signout } = useAuth()
  const [cookieToken, setCookieToken] = useState<string | undefined>()
  const [lastAction, setLastAction] = useState<string>('')

  // Update cookie token whenever user changes
  useEffect(() => {
    const token = Cookies.get('auth_token')
    setCookieToken(token)
    setLastAction(`Cookie checked: ${new Date().toLocaleTimeString()}`)
  }, [user])

  const handleTestLogin = async () => {
    try {
      await signin('rayaan1516@gmail.com', 'password123')
      setLastAction('Login attempted')
    } catch (error) {
      setLastAction(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleTestLogout = async () => {
    try {
      await signout()
      setLastAction('Logout attempted')
    } catch (error) {
      setLastAction(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold">User Status:</h3>
              <pre className="bg-gray-100 p-2 rounded">
                {user ? JSON.stringify(user.email, null, 2) : 'Not logged in'}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold">Auth Cookie:</h3>
              <pre className="bg-gray-100 p-2 rounded">
                {cookieToken ? 
                  `${cookieToken.slice(0, 20)}...` : 
                  'No token found'}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold">Last Action:</h3>
              <pre className="bg-gray-100 p-2 rounded">{lastAction}</pre>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleTestLogin}>
                Test Login
              </Button>
              <Button onClick={handleTestLogout} variant="destructive">
                Test Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 