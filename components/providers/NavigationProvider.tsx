'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/shared/navigation/Navbar'
import { SideNavigation } from '@/components/shared/navigation/Sidebar'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Show navbar only on landing page
  if (pathname === '/') {
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