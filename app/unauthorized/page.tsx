'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Unauthorized Access</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <Button 
          className="mt-8" 
          onClick={() => router.push('/home')}
        >
          Return Home
        </Button>
      </div>
    </div>
  )
} 