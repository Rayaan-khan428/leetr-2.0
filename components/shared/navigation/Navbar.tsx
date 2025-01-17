'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { ThemeToggle } from '@/components/theme-toggle'

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

  // Navigation items that appear when logged in
  const authenticatedItems = [
    { href: '/problems', label: 'Problems' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/settings', label: 'Settings' },
    { href: '/test', label: 'Test' },
    { href: '/friends', label: 'Friends' },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Home link - always visible */}
        <Link 
          href={user ? '/' : '/'} 
          className="text-xl font-bold"
        >
          Leetr
        </Link>

        

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavigationMenu>
            <NavigationMenuList>
              {user ? (
                // Authenticated navigation items
                <>
                  {authenticatedItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <Link 
                        href={item.href} 
                        legacyBehavior 
                        passHref
                      >
                        <NavigationMenuLink 
                          className={navigationMenuTriggerStyle()}
                          active={pathname === item.href}
                        >
                          {item.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                  <NavigationMenuItem>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                // Non-authenticated navigation items
                <>
                  <NavigationMenuItem>
                    <Link href="/login" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Login
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/register" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Register
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}