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
  business_timeline_events: Database['public']['Tables']['business_timeline_events']['Row'][]
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
          ),
          business_timeline_events(*)
        `)
        .eq('id', businessId)
        .single()
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
      <div className="relative mb-12 sm:mb-24">
        <BusinessCover 
          color={business?.brand_color ?? "#000000"}
          onColorChange={(color) => colorMutation.mutate(color)}
          className="h-[100px] sm:h-[120px]"
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
            <div className="relative -mt-12 mx-auto sm:mx-0 sm:-mt-8">
              <div className="relative">
                <img
                  src={`${business.logo_url || business.place?.logo_url}?t=${Date.now()}`}
                  alt={business.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
                />
                <LogoUpload 
                  businessId={businessId}
                  currentLogo={business.logo_url}
                  onSuccess={(logoUrl) => logoMutation.mutate(logoUrl)}
                  className="absolute inset-0"
                />
              </div>
            </div>

            <div className="text-center sm:text-left pt-4 sm:pt-8 space-y-3 sm:space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold">{business.name}</h1>
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-4">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(business.place?.formatted_address || '')
                          toast.success('Address copied to clipboard')
                        }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <MapPin className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={5} className="max-w-[200px] sm:max-w-none text-center sm:text-left">
                      <p>Click to copy address</p>
                    </TooltipContent>
                  </Tooltip>

                  {business.place?.phone_number && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(business.place?.phone_number || '')
                            toast.success('Phone number copied to clipboard')
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Phone className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p>Click to copy phone number</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {business.place?.website && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(business.place?.website || '')
                            toast.success('Website URL copied to clipboard')
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Globe className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p>Click to copy website URL</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <StaffIntroSection 
              businessId={businessId} 
              color={business?.brand_color ?? "#000000"}
            />
          </div>

          {/* Story Section */}
          <div className="mt-12 -mx-4">
            <BusinessTimeline 
              businessId={businessId} 
              events={timelineEvents || []}
            color={business?.brand_color ?? "#000000"}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 