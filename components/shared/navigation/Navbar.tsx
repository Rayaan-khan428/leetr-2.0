'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, User, Sparkles } from 'lucide-react'

export default function Navbar() {
  const { user, signout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Handle logout
  const handleLogout = async () => {
    try {
      await signout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user?.displayName) return 'U'
    return user.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="fixed top-0 w-full z-50 border-b dark:border-gray-800 border-gray-200 dark:bg-black/50 bg-white/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Home link */}
        <Link 
          href="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400"
        >
          Leetr
        </Link>

        <div className="flex items-center gap-6">
          {/* Main Navigation - Only shown when logged in */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/problems" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Problems
              </Link>
            </nav>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8 hover:ring-2 ring-primary transition-all">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User avatar'} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/problems')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/pricing')}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Premium
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <ShimmerButton>
                  <Link href="/login" className="px-4 py-2 text-sm">
                    Get Started
                  </Link>
                </ShimmerButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}