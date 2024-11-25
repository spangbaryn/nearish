'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Nearish!</CardTitle>
            <CardDescription>
              You're signed in as {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-medium">Account Details</h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Email: {user?.email}</p>
                  <p>Last Sign In: {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 