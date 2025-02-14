"use client";

import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SideNavigation } from "@/components/shared/navigation/Sidebar";

export default function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      );
    }
    
    if (!user) {
      redirect('/login');
    }
  
    return <SideNavigation>{children}</SideNavigation>;
  } 