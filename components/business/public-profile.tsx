"use client"

import { MapPin, Phone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { BusinessCover } from "app/components/ui/business-cover"
import { StaffIntroSection } from "app/components/business/staff-intro-section"
import { BusinessTimeline } from "app/components/ui/business-timeline"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

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
      logo_url?: string | null
    } | null
  }
  timelineEvents?: any[]  // adjust type as needed
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

  return (
    <div>
      <BusinessCover
        color={business.brand_color || '#000000'}
        className="h-[120px] sm:h-[160px]"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 mb-12">
          <div className="relative -mt-12 mx-auto sm:mx-0 sm:-mt-8">
            {business.logo_url || (business.place && business.place.logo_url) ? (
              <img
                src={business.logo_url || business.place?.logo_url || undefined}
                alt={business.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
              />
            ) : null}
          </div>
          <div className="text-center sm:text-left pt-4 sm:pt-8 space-y-3 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{business.name}</h1>
            <div className="flex justify-center sm:justify-start gap-6 sm:gap-4">
              {business.place?.formatted_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {business.place.formatted_address}
                  </span>
                </div>
              )}
              {business.place?.phone_number && (
                <div className="flex items-center gap-1">
                  <Phone className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {business.place.phone_number}
                  </span>
                </div>
              )}
              {business.place?.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {business.place.website}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-12">
          <StaffIntroSection 
            businessId={business.id} 
            color={business.brand_color} 
            readOnly={true} 
          />
          <BusinessTimeline 
            businessId={business.id} 
            events={timelineEventsData || []} 
            color={business.brand_color} 
            readOnly={true} 
          />
        </div>
      </div>
    </div>
  )
} 