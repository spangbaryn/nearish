"use client"

import { useEffect } from 'react'
import { refreshSession } from '@/app/lib/auth-helpers'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>
} 