'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

// Import shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Github, Mail } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const { signInWithGithub, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
      router.push('/problems')
    } catch (err) {
      setError('Failed to sign in with GitHub. Please try again.')
      console.error('GitHub login error:', err)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.push('/problems')
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.')
      console.error('Google login error:', err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center text-3xl font-bold tracking-tight">Welcome</CardTitle>
          <CardDescription className="text-center text-base">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base hover:bg-accent hover:text-accent-foreground transition-colors duration-300" 
              onClick={handleGithubSignIn}
            >
              <Github className="mr-3 h-5 w-5" />
              Continue with GitHub
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 text-base hover:bg-accent hover:text-accent-foreground transition-colors duration-300" 
              onClick={handleGoogleSignIn}
            >
              <Mail className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}