"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  if (user?.role !== 'admin') {
    redirect('/')
  }

  return <>{children}</> 
} 