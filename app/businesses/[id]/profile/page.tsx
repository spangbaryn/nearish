"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Phone, Globe, Facebook } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { BusinessCover } from "../../../components/ui/business-cover"
import { ColorPicker } from "../../../components/ui/color-picker"
import { Database } from "@/types/database.types"
import { LogoUpload } from "../../../components/ui/logo-upload"
import { BusinessTimeline } from "../../../components/ui/business-timeline"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StaffIntroSection } from "../../../components/business/staff-intro-section"

type BusinessProfile = Database['public']['Tables']['businesses']['Row'] & {
  place: {
    formatted_address: string
    phone_number: string | null
    website: string | null
    last_synced_at: string | null
    logo_url: string | null
  } | null
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

  const { data: timelineEvents } = useQuery({
    queryKey: ['business-timeline', businessId],
    queryFn: async () => {
      // First get the timeline events
      const { data: events, error: eventsError } = await supabase
        .from('business_timeline_events')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: true })

      if (eventsError) throw eventsError

      // Then get the profiles for those events
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', events.map(event => event.created_by))

      if (profilesError) throw profilesError

      // Combine the data
      return events.map(event => ({
        ...event,
        created_by: profiles.find(profile => profile.id === event.created_by)
      }))
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
      <div className="relative mb-24">
        <BusinessCover 
          color={business?.brand_color ?? undefined}
          onColorChange={(color) => colorMutation.mutate(color)}
          className="h-[120px]"
        />
        
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-start gap-8">
            <div className="relative -mt-8">
              <div className="relative">
                <img
                  src={`${business.logo_url || business.place?.logo_url}?t=${Date.now()}`}
                  alt={business.name}
                  className="w-40 h-40 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
                />
                <LogoUpload 
                  businessId={businessId}
                  currentLogo={business.logo_url}
                  onSuccess={(logoUrl) => logoMutation.mutate(logoUrl)}
                  className="absolute inset-0"
                />
              </div>
            </div>
            
            <div className="pt-8 space-y-2">
              <h1 className="text-4xl font-bold">{business.name}</h1>
              <div className="flex gap-4">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <MapPin className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent sideOffset={5}>
                      <p>{business.place?.formatted_address}</p>
                    </TooltipContent>
                  </Tooltip>

                  {business.place?.phone_number && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Phone className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p>{business.place.phone_number}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {business.place?.website && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          href={business.place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p>{business.place.website}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <StaffIntroSection businessId={businessId} />
          </div>

          <BusinessTimeline 
            businessId={businessId}
            events={timelineEvents || []}
            color={business?.brand_color ?? undefined}
          />

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