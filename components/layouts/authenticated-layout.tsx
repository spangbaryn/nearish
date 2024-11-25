"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar-01"

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 