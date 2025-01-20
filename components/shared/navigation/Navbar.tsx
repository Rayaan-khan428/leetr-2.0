'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { SideNavigation } from './Sidebar'

export default function Navbar() {
  const { user } = useAuth()

  // If user is logged in, show the side navigation
  if (user) {
    return <SideNavigation />
  }

  // Otherwise show the regular navbar
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/pricing"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <ShimmerButton className="rounded-lg py-1 px-4 text-sm">
              <Link href="/login" className="inline-flex items-center gap-2">
                Get Started
              </Link>
            </ShimmerButton>
          </div>
        </div>
      </div>
    </header>
  )
}