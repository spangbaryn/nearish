"use client"

import { Wordmark } from "@/components/ui/wordmark"
import { Logo } from "@/components/ui/logo"
import { PublicNav } from "@/components/public-nav"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function PublicHeader() {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  
  if (isLoading) return null
  if (user) return null

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex h-16 items-center px-6 bg-gradient-to-br from-muted/50 via-background to-muted/50">
      <div className="flex w-full items-center justify-between">
        {!isHomePage && (
          <Link href="/">
            <div className="block md:hidden">
              <Logo />
            </div>
            <div className="hidden md:block">
              <Wordmark />
            </div>
          </Link>
        )}
        <div className={!isHomePage ? "" : "ml-auto"}>
          <PublicNav />
        </div>
      </div>
    </header>
  )
} 