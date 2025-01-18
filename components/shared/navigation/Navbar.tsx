'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'

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

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Home link */}
        <Link 
          href="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400"
        >
          Leetr
        </Link>

        <div className="flex items-center gap-6">
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/problems" 
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Problems
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-sm text-gray-300 hover:text-white"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <ShimmerButton>
                  <Link href="/dashboard" className="px-4 py-2 text-sm">
                    Dashboard
                  </Link>
                </ShimmerButton>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <ShimmerButton>
                  <Link href="/register" className="px-4 py-2 text-sm">
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