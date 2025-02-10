"use client"

import { useEffect, useState } from 'react'
import { refreshSession } from '@/app/lib/auth-helpers'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export function RootLayoutClient({ 
  children,
  className
}: { 
  children: React.ReactNode
  className?: string
}) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const handleDeploymentChange = async () => {
      const currentVersion = process.env.NEXT_PUBLIC_VERSION
      const storedVersion = localStorage.getItem('app-version')
      
      if (currentVersion !== storedVersion) {
        try {
          await refreshSession()
        } catch (error) {
          console.error('Session refresh error:', error)
        } finally {
          localStorage.setItem('app-version', currentVersion || '')
        }
      }
    }

    handleDeploymentChange()
  }, [])

  return (
    <div className={className}>
      {children}
    </div>
  )
} 