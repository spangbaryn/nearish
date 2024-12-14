"use client"

import { MainHeader } from "@/components/main-header"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  // Always render the SidebarProvider to maintain consistent structure
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <LoadingSpinner />
          </div>
        ) : !user ? (
          children
        ) : (
          <>
            <MainHeader />
            <div className="flex flex-1 w-full">
              <MainSidebar />
              <main className="flex-1 pt-14 bg-background w-full">
                {children}
              </main>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  )
} 