"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import MainSidebar from "@/components/layouts/main-sidebar"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    // You might want to show a loading spinner here
    return null
  }

  if (!user) {
    redirect('/login')
  }

  return <MainSidebar>{children}</MainSidebar>
} 