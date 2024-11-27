'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/home')
    }
  }, [user, loading, router])

  if (loading) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  )
} 