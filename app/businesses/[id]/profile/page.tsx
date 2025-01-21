"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Phone, Globe, RefreshCw, Facebook } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { BusinessCover } from "../../../components/ui/business-cover"
import { syncPlaceData } from "@/app/actions/sync-place"
import { ColorPicker } from "../../../components/ui/color-picker"
import { Database } from "@/types/database.types"
import { LogoUpload } from "../../../components/ui/logo-upload"

type BusinessProfile = Database['public']['Tables']['businesses']['Row'] & {
  place: {
    formatted_address: string
    phone_number: string | null
    website: string | null
    last_synced_at: string
    logo_url: string | null
  }
}

export default function BusinessProfilePage() {
  const params = useParams()
  const businessId = params.id as string

  const queryClient = useQueryClient()

  const { data: business, isLoading } = useQuery<BusinessProfile>({
    queryKey: ['business-profile', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          place:places(
            formatted_address,
            phone_number,
            website,
            last_synced_at,
            logo_url
          )
        `)
        .eq('id', businessId)
        .single()
      if (error) throw error
      return data
    }
  })

  const { data: posts } = useQuery({
    queryKey: ['business-posts', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const syncMutation = useMutation({
    mutationFn: () => syncPlaceData(business!.place_id),
    onSuccess: () => {
      toast.success("Business information synced with Google")
    },
    onError: () => {
      toast.error("Failed to sync business information")
    }
  })

  const colorMutation = useMutation({
    mutationFn: async (color: string) => {
      const { error } = await supabase
        .from('businesses')
        .update({ brand_color: color })
        .eq('id', businessId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] })
    }
  })

  const logoMutation = useMutation({
    mutationFn: async (logoUrl: string) => {
      const { error } = await supabase
        .from('businesses')
        .update({ logo_url: logoUrl })
        .eq('id', businessId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] })
    }
  })

  if (isLoading) return <LoadingSpinner />
  if (!business) return null

  return (
    <div>
      <div className="relative">
        <BusinessCover 
          color={business?.brand_color} 
          onColorChange={(color) => colorMutation.mutate(color)}
        />
        <div className="absolute max-w-4xl w-full mx-auto inset-x-0 px-8">
          <div className="relative">
            <div className="absolute -bottom-16 flex flex-col gap-2">
              {business.logo_url && (
                <img
                  src={`${business.logo_url}?t=${Date.now()}`}
                  alt={business.name}
                  className="w-32 h-32 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
                />
              )}
              <LogoUpload 
                businessId={businessId}
                currentLogo={business.logo_url}
                onSuccess={(logoUrl) => logoMutation.mutate(logoUrl)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{business.name}</CardTitle>
                  <CardDescription>
                    Last synced: {new Date(business.place.last_synced_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4 mr-2",
                      syncMutation.isPending && "animate-spin"
                    )} />
                    Sync with Google
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{business.place.formatted_address}</p>
                </div>
              </div>

              {business.place.phone_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{business.place.phone_number}</p>
                  </div>
                </div>
              )}

              {business.place.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={business.place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:text-secondary/80"
                    >
                      {business.place.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            {posts?.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <p className="text-sm text-muted-foreground">
                        Posted {new Date(post.created_at).toLocaleDateString()}
                        {post.source === 'facebook' && (
                          <span className="ml-2 inline-flex items-center">
                            <Facebook className="h-3 w-3 mr-1 text-[#1877F2]" />
                            Posted to Facebook
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {posts?.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 