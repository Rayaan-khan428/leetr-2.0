'use client'

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
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

  const handleLogout = async () => {
    try {
      await signout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const links = [
    {
      label: "Menu",
      icon: (
        <IconMenu2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => setOpen(!open),
    },
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
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: handleLogout,
    },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} setOpen={setOpen} className="border-r border-border">
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ThemeToggle />
            {user && (
              <SidebarLink
                link={{
                  label: user.displayName || "User",
                  href: "/settings",
                  icon: user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user.displayName?.[0] || "U"}
                    </div>
                  ),
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div 
        className={cn(
          "flex-1 transition-all duration-300",
          "md:ml-[60px]", // Default margin for collapsed state
          open && "md:ml-[240px]" // Expanded state margin
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
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