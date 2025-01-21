'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'

export function Navbar() {
  const { user } = useAuth()
  
  return (
    <header className="fixed top-0 w-full z-50 border-b dark:border-gray-800 border-gray-200 dark:bg-black/50 bg-white/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400"
        >
          Leetr
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/pricing"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <ShimmerButton className="rounded-lg py-0.5 px-4 text-sm h-10">
              <Link href={user ? "/dashboard" : "/login"} className="inline-flex items-center gap-2">
                {user ? 'Dashboard' : 'Get Started'}
              </Link>
            </ShimmerButton>
          </div>
        </div>
      </div>
    </header>
  )
}