"use client"

import { Wordmark } from "@/components/ui/wordmark"
import { Logo } from "@/components/ui/logo"
import { PublicNav } from "@/components/public-nav"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function PublicHeader() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return null
  if (user) return null

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex h-16 items-center px-6 bg-muted/15">
      <div className="flex w-full items-center justify-between">
        <Link href="/">
          <div className="block md:hidden">
            <Logo className="h-8" />
          </div>
          <div className="hidden md:block">
            <Wordmark />
          </div>
        </Link>
        <PublicNav />
      </div>
    </header>
  )
} 