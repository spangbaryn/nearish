"use client"

import { Wordmark } from "@/components/ui/wordmark"
import { PublicNav } from "@/components/public-nav"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function PublicHeader() {
  const { user } = useAuth()
  
  if (user) return null

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex h-16 items-center px-6">
      <div className="flex w-full items-center justify-between">
        <Link href="/">
          <Wordmark />
        </Link>
        <PublicNav />
      </div>
    </header>
  )
} 