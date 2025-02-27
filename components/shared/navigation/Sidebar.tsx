"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconSettings,
  IconUserBolt,
  IconMenu2,
} from "@tabler/icons-react"
import { ThemeToggle } from '@/components/theme-toggle'

export function SideNavigation({ children }: { children?: React.ReactNode }) {
  const { user, signout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = useCallback(() => {
    signout()
  }, [signout])

  const links = [
    {
      label: "Problems",
      href: "/problems",
      icon: (
        <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Community",
      href: "/friends",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: handleLogout,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <div 
        className={cn(
          "relative h-screen bg-background border-r transition-all duration-300 flex-shrink-0",
          "group hover:w-64 w-20"
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex flex-col h-full p-4 sticky top-0">
          <div className="flex justify-between items-center mb-8">
            <div className="transition-opacity duration-300">
              {open ? <Logo /> : <LogoIcon />}
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="relative">
                {link.href ? (
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors",
                      "text-sm text-muted-foreground hover:text-foreground"
                    )}
                    onClick={link.onClick}
                  >
                    {link.icon}
                    <span className={cn(
                      "transition-all duration-300",
                      "opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    )}>
                      {link.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={link.onClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors w-full",
                      "text-sm text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.icon}
                    <span className={cn(
                      "transition-all duration-300",
                      "opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    )}>
                      {link.label}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-4 space-y-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3 px-3 py-2">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
                <span className={cn(
                  "text-sm transition-all duration-300",
                  "opacity-0 group-hover:opacity-100 whitespace-nowrap"
                )}>
                  {user.displayName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Leetr
      </motion.span>
    </Link>
  )
}

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  )
}

export { SideNavigation as Sidebar }
export default SideNavigation 