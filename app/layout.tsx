"use client"

import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import "./styles/globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
import { Toaster } from 'sonner'
import { AuthProvider } from "@/lib/auth-context"
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { refreshSession, clearAuthCookies } from '@/app/lib/auth-helpers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Nearish",
  description: "A social network for small businesses and their customers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const handleDeploymentChange = async () => {
      const currentVersion = process.env.NEXT_PUBLIC_VERSION
      const storedVersion = localStorage.getItem('app-version')
      
      if (currentVersion !== storedVersion) {
        // New deployment detected
        const sessionRefreshed = await refreshSession()
        if (!sessionRefreshed) {
          clearAuthCookies()
        }
        localStorage.setItem('app-version', currentVersion || '')
      }
    }

    handleDeploymentChange()
  }, [])

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}