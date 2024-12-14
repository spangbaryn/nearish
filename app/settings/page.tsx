"use client"

import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="appearance">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance Settings</h3>
                {/* Add appearance settings here */}
              </div>
            </TabsContent>
            <TabsContent value="notifications">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                {/* Add notification settings here */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 