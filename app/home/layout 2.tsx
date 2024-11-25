'use client'

import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <SidebarProvider defaultOpen>
        <AppSidebar className="w-64 border-r" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
} 