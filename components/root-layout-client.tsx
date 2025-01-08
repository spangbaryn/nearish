"use client"

import { MainHeader } from "@/components/main-header"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PublicHeader } from "@/components/public-header"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <PublicHeader />
        <main className="pt-16">
          {children}
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        <MainHeader />
        <div className="flex flex-1 pt-16 w-full">
          <MainSidebar />
          <main className="flex-1 bg-muted/15 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 