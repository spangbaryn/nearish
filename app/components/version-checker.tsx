"use client"

import { useEffect } from 'react'
import { refreshSession, clearAuthCookies } from '@/app/lib/auth-helpers'

export function VersionChecker() {
  useEffect(() => {
    const handleDeploymentChange = async () => {
      const currentVersion = process.env.NEXT_PUBLIC_VERSION
      const storedVersion = localStorage.getItem('app-version')
      
      if (currentVersion !== storedVersion) {
        const sessionRefreshed = await refreshSession()
        if (!sessionRefreshed) {
          clearAuthCookies()
        }
        localStorage.setItem('app-version', currentVersion || '')
      }
    }

    handleDeploymentChange()
  }, [])

  return null
} 