"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import MainSidebar from "@/components/layouts/main-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { UserRole } from "@/lib/roles"
import { useAuthorization } from "@/components/hooks/use-authorization"
import { useEffect } from "react"
import { AuthApiError } from "@supabase/supabase-js"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export default function AuthenticatedLayout({ 
  children,
  requiredRoles = ['user']
}: AuthenticatedLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const { checkAccess } = useAuthorization()
  const router = useRouter()

  useEffect(() => {
    const handleAuthError = async (error: unknown) => {
      if (
        error instanceof AuthApiError && 
        (error.code === 'refresh_token_not_found' || error.status === 400)
      ) {
        await signOut()
        router.push('/login')
      }
    }

    if (!loading && !user) {
      handleAuthError({ code: 'refresh_token_not_found', status: 400 })
    }
  }, [user, loading, signOut, router])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requiredRoles.length > 0 && !checkAccess(requiredRoles)) {
        router.push('/unauthorized')
      }
    }
  }, [user, loading, requiredRoles, checkAccess, router])

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-[200px] mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <MainSidebar>{children}</MainSidebar>
} 