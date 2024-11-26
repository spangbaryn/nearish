'use client'

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const { user } = useAuth()

  // Get display name from email if name is not available
  const displayName = user?.name || user?.email?.split('@')[0] || ''

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your account statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No statistics available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No actions available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 