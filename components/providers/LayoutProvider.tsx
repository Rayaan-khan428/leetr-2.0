'use client'

import { useAuth } from '@/context/AuthContext'
import { SideNavigation } from '@/components/shared/navigation/Sidebar'
import Navbar from '@/components/shared/navigation/Navbar'

export function LayoutProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <SideNavigation>
          {children}
        </SideNavigation>
      ) : (
        <>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </>
      )}
    </div>
  )
} 