'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/navigation/Navbar'
import { SideNavigation } from '@/components/shared/navigation/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

// Public paths that don't require auth
const PUBLIC_PATHS = ['/', '/login', '/pricing', '/about']

// Paths that require authentication
const PROTECTED_PATHS = [
  '/problems',
  '/friends',
  '/settings',
  '/dashboard'
]

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [intendedPath, setIntendedPath] = useState<string | null>(null)
  
  useEffect(() => {
    if (!loading) {
      // Check if current path requires authentication
      const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path))
      
      if (requiresAuth && !user) {
        // Store where they were trying to go
        setIntendedPath(pathname)
        router.push('/login')
      } else if (user && pathname === '/login' && intendedPath) {
        // If they're logged in and on the login page, redirect them to their intended destination
        router.push(intendedPath)
        setIntendedPath(null)
      }
    }
  }, [pathname, user, router, loading, intendedPath])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  // Show navbar on public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return (
      <>
        <Navbar />
        {children}
      </>
    )
  }

  // Show sidebar on all other pages
  return <SideNavigation>{children}</SideNavigation>
} 