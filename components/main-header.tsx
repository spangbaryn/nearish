"use client"

import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/lib/auth-context"

export function MainHeader() {
  const { user } = useAuth()
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b bg-sidebar px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="text-sm text-muted-foreground">
          {user?.email}
        </div>
      </div>
    </header>
  )
} 