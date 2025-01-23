"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AddTimelineEventDialog } from "./add-timeline-event-dialog"
import { TimelineEventOverlay } from "./timeline-event-overlay"
import { Database } from "@/types/database.types"
import { MuxVideoPlayer } from "./mux-video-player"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EditTimelineEventDialog } from "./edit-timeline-event-dialog"

type TimelineEvent = Database['public']['Tables']['business_timeline_events']['Row'] & {
  created_by: Database['public']['Tables']['profiles']['Row']
  video_asset_id?: string
  video_playback_id?: string
  thumbnail_url?: string
  video_duration?: number
  video_status?: string
}

export function BusinessTimeline({ businessId, events }: { businessId: string, events: TimelineEvent[] }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  console.log('Timeline Events:', events.map(e => ({
    id: e.id,
    title: e.title,
    created_by: e.created_by
  })))

  const shouldShowYear = (event: TimelineEvent, index: number) => {
    const currentYear = new Date(event.date).getFullYear()
    if (index === 0) return true
    
    const prevYear = new Date(events[index - 1].date).getFullYear()
    return currentYear !== prevYear
  }

  if (!events?.length) {
    return (
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <AddTimelineEventDialog businessId={businessId} />
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">No events yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Our Story</h2>
        <AddTimelineEventDialog businessId={businessId} />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-12 relative">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex-shrink-0">
                {shouldShowYear(event, index) && (
                  <div className="absolute -bottom-12 left-0 text-2xl font-bold text-muted-foreground/20">
                    {new Date(event.date).getFullYear()}
                  </div>
                )}
                <Card 
                  className={cn(
                    "min-w-[200px] cursor-pointer transition-colors relative group",
                    selectedEvent?.id === event.id && "border-primary"
                  )}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.edit-button')) {
                      setSelectedEvent(event)
                    }
                  }}
                >
                  <EditTimelineEventDialog event={event} className="edit-button" />
                  <CardContent className="p-4 pb-10">
                    <time className="text-xs text-muted-foreground/60">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </time>
                    <h3 className="font-semibold mt-2">{event.title}</h3>
                    {event.thumbnail_url && (
                      <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md">
                        <Image
                          src={event.thumbnail_url}
                          alt={`Thumbnail for ${event.title}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={event.created_by?.avatar_url} 
                          alt={event.created_by?.full_name || 'User'} 
                        />
                        <AvatarFallback>
                          {event.created_by?.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
                {index < events.length - 1 && (
                  <div className="timeline-connector" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <TimelineEventOverlay 
          events={sortedEvents.filter(e => e.video_playback_id)}
          currentEventId={selectedEvent.id}
          onClose={() => setSelectedEvent(null)}
          onEventChange={(eventId) => {
            const newEvent = events.find(e => e.id === eventId)
            if (newEvent) setSelectedEvent(newEvent)
          }}
        />
      )}
    </div>
  )
} 