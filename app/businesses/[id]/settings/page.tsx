"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Facebook } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DisconnectAlert } from "./components/disconnect-alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database } from "@/types/database.types"
import { FacebookPageSelector } from "./components/facebook-page-selector"

type Business = Database['public']['Tables']['businesses']['Row']

export default function BusinessSettingsPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const businessId = params.id as string
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  // Fetch business and its Facebook connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['business-social-connections', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_social_connections')
        .select('*')
        .eq('business_id', businessId)
        .eq('platform', 'facebook')

      if (error) throw error
      return data
    }
  })

  // Add business query
  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) throw error
      return data as Business
    }
  })

  useEffect(() => {
    if (success) {
      toast.success('Facebook pages connected successfully')
    }
  }, [success])

  // Add state for loading
  const [isConnecting, setIsConnecting] = useState(false)

  // Function to handle Facebook login and page selection
  const handleFacebookConnect = async () => {
    setIsConnecting(true)
    try {
      const redirectUri = `${window.location.origin}/api/auth/facebook?businessId=${businessId}`
      window.location.href = redirectUri
    } catch (error) {
      setIsConnecting(false)
      toast.error('Failed to connect Facebook')
    }
  }

  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)
  const [pageToDisconnect, setPageToDisconnect] = useState<{id: string, name: string} | null>(null)

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      // Delete the social connection
      const { error: connectionError } = await supabase
        .from('business_social_connections')
        .delete()
        .eq('id', connectionId)

      if (connectionError) throw connectionError

      // Clean up any temporary pages
      const { error: tempError } = await supabase
        .from('temp_facebook_pages')
        .delete()
        .eq('business_id', businessId)

      if (tempError) throw tempError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-social-connections', businessId]
      })
      queryClient.invalidateQueries({
        queryKey: ['temp-facebook-pages', businessId]
      })
      toast.success('Facebook page disconnected')
      setPageToDisconnect(null)
    },
    onError: (error: any) => {
      toast.error('Failed to disconnect Facebook page', {
        description: error.message
      })
    },
    onSettled: () => {
      setDisconnectingId(null)
    }
  })

  const handleDisconnect = async (connectionId: string) => {
    setDisconnectingId(connectionId)
    await disconnectMutation.mutateAsync(connectionId)
  }

  const showPageSelector = searchParams.get('showPageSelector') === 'true'

  // Add query for temporary pages
  const { data: tempPages } = useQuery({
    queryKey: ['temp-facebook-pages', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_facebook_pages')
        .select('*')
        .eq('business_id', businessId)

      if (error) throw error
      return data
    },
    enabled: showPageSelector
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/businesses/${businessId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Business Settings</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm">{business?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm">
                        {business?.created_at && new Date(business.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              {/* New Facebook integration card */}
              <Card>
                <CardHeader>
                  <CardTitle>Facebook Pages</CardTitle>
                  <CardDescription>
                    Connect your Facebook pages to import posts and publish content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections?.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No Facebook pages connected. Connect a page to import posts and publish content.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {connections?.map((connection) => (
                      <div 
                        key={connection.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={`https://graph.facebook.com/${connection.external_id}/picture`} 
                              alt={connection.name} 
                            />
                            <AvatarFallback>
                              <Facebook className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{connection.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Connected {connection.created_at ? new Date(connection.created_at).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setPageToDisconnect({
                            id: connection.id,
                            name: connection.name
                          })}
                          disabled={disconnectingId === connection.id}
                        >
                          {disconnectingId === connection.id ? (
                            <>
                              <LoadingSpinner className="mr-2 h-4 w-4" />
                              Disconnecting...
                            </>
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={handleFacebookConnect}
                      className="w-full"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Connecting to Facebook...
                        </>
                      ) : (
                        <>
                          <Facebook className="h-4 w-4 mr-2" />
                          Connect Facebook Page
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other tabs content */}
          </Tabs>
        </div>
      </div>

      <DisconnectAlert 
        open={!!pageToDisconnect}
        onOpenChange={(open) => !open && setPageToDisconnect(null)}
        onConfirm={() => pageToDisconnect && handleDisconnect(pageToDisconnect.id)}
        pageName={pageToDisconnect?.name || ''}
        isLoading={!!disconnectingId}
      />

      {showPageSelector && tempPages && (
        <FacebookPageSelector 
          pages={tempPages.map(p => ({
            id: p.page_id,
            name: p.page_name,
            access_token: p.access_token
          }))}
          onComplete={() => {
            window.location.href = `${window.location.pathname}?success=true`
          }}
        />
      )}
    </div>
  )
} 