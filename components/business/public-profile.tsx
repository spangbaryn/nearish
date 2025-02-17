"use client"

import { MapPin, Phone, Globe, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { BusinessCover } from "app/components/ui/business-cover"
import { StaffIntroSection } from "app/components/business/staff-intro-section"
import { BusinessTimeline } from "app/components/ui/business-timeline"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

interface PublicBusinessProfileProps {
  business: {
    id: string
    name: string
    brand_color: string
    logo_url: string | null
    place?: {
      formatted_address: string
      phone_number: string | null
      website: string | null
      place_logo_url?: string | null
    } | null
  }
  timelineEvents?: any[]
}

export function PublicBusinessProfile({ business, timelineEvents = [] }: PublicBusinessProfileProps) {
  const { data: timelineEventsData } = useQuery({
    queryKey: ['business-timeline', business.id],
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from('business_timeline_events')
        .select('*')
        .eq('business_id', business.id)
        .order('date', { ascending: true })

      if (eventsError) throw eventsError

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', events.map(event => event.created_by))

      if (profilesError) throw profilesError

      return events.map(event => ({
        ...event,
        created_by: profiles.find(profile => profile.id === event.created_by)
      }))
    }
  })

  const [timestamp, setTimestamp] = useState("")
  
  useEffect(() => {
    setTimestamp(`?t=${Date.now()}`)
  }, [])

  return (
    <div>
      <BusinessCover
        color={business.brand_color || '#000000'}
        className="h-[120px] sm:h-[160px]"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 mb-12">
          <div className="relative -mt-12 mx-auto sm:mx-0 sm:-mt-8">
            <img
              src={`${business.logo_url || business.place?.place_logo_url}${timestamp}`}
              alt={business.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
            />
          </div>
          <div className="text-center sm:text-left pt-4 sm:pt-8 space-y-3 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{business.name}</h1>
            <div className="flex gap-4 mt-4">
              {business.place?.formatted_address && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (business.place?.formatted_address) {
                            navigator.clipboard.writeText(business.place.formatted_address)
                            toast.success('Address copied to clipboard')
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy address</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {business.place?.phone_number && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (business.place?.phone_number) {
                            navigator.clipboard.writeText(business.place.phone_number)
                            toast.success('Phone number copied to clipboard')
                          }
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy phone number</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {business.place?.website && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (business.place?.website) {
                            navigator.clipboard.writeText(business.place.website)
                            toast.success('Website copied to clipboard')
                          }
                        }}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy website</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <StaffIntroSection 
            businessId={business.id} 
            color={business.brand_color ?? "#000000"}
            readOnly
          />
        </div>

        <div className="mt-12">
          <BusinessTimeline 
            businessId={business.id} 
            events={timelineEventsData || timelineEvents}
            color={business.brand_color ?? "#000000"}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  )
}