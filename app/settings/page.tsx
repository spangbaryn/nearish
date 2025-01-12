"use client"

import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      // Upload image to Supabase Storage with user ID as folder
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName)

      // Update user profile in auth and profiles table
      const { error: updateError } = await supabase.auth
        .updateUser({ data: { avatar_url: publicUrl } })

      if (updateError) throw updateError

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          metadata: {
            ...user?.metadata,
            avatar_url: publicUrl
          }
        })
        .eq('id', user?.id)

      if (profileError) throw profileError

      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Avatar updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update avatar', {
        description: error.message
      })
    }
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    avatarMutation.mutate(file)
  }

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
            <TabsContent value="account" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar_url ?? ''} alt={user?.email ?? ''} />
                      <AvatarFallback className="text-lg">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Uploading...
                          </>
                        ) : (
                          'Change Avatar'
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Recommended: Square image, at least 400x400px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{user?.email}</p>
                  </div>
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