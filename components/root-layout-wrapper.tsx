"use client"

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

interface RootLayoutWrapperProps {
  children: React.ReactNode
  className?: string
}

export function RootLayoutWrapper({ children, className }: RootLayoutWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn(
      className,
      "min-h-screen bg-background",
      mounted ? "vsc-initialized" : ""
    )}>
      {children}
    </div>
  )
} 