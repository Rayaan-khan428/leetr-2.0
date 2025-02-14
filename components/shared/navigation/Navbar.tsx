"use client"

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function Navbar() {
  const { user } = useAuth()
  
  return (
    <nav className="fixed top-0 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400"
        >
          Leetr
        </Link>

        <div className="flex items-center gap-8">
          <ThemeToggle />
          <nav className="flex items-center gap-6">
            <Link 
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link href="/login">
              <ShimmerButton className="rounded-lg py-0.5 px-4 text-sm h-10">
                {user ? 'Dashboard' : 'Login'}
              </ShimmerButton>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;