"use client"

import { MainHeader } from "@/components/main-header"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <MainHeader />
        <div className="flex flex-1 w-full">
          <MainSidebar />
          <main className="flex-1 pt-14 bg-background w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 