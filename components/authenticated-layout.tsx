"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MainSidebar } from "@/components/main-sidebar"

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, error } = useAuth();

  if (error) {
    redirect("/auth/login");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MainSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 