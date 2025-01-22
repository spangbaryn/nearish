"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AddTimelineEventDialog } from "./add-timeline-event-dialog"
import { Database } from "@/types/database.types"
import { MuxVideoPlayer } from "./mux-video-player"
import { useState } from "react"
import { cn } from "@/lib/utils"

type TimelineEvent = Database['public']['Tables']['business_timeline_events']['Row'] & {
  created_by: Database['public']['Tables']['profiles']['Row']
}

export function BusinessTimeline({ 
  businessId,
  events 
}: { 
  businessId: string
  events: TimelineEvent[]
}) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

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

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Our Story</h2>
        <AddTimelineEventDialog businessId={businessId} />
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-12 relative">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative">
            {shouldShowYear(event, index) && (
              <div className="absolute -bottom-12 left-0 text-2xl font-bold text-muted-foreground/20">
                {new Date(event.date).getFullYear()}
              </div>
            )}
            <Card 
              className={cn(
                "min-w-[200px] cursor-pointer transition-colors",
                selectedEvent?.id === event.id && "border-primary"
              )}
              onClick={() => setSelectedEvent(event)}
            >
              <CardContent className="p-4">
                <time className="text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()}
                </time>
                <h3 className="font-semibold mt-2">{event.title}</h3>
                {event.video_playback_id && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Click to play video
                  </div>
                )}
              </CardContent>
            </Card>
            {index < events.length - 1 && (
              <div className="timeline-connector" />
            )}
          </div>
        ))}
      </div>

      {selectedEvent?.video_playback_id && (
        <Card>
          <CardContent className="p-4">
            <MuxVideoPlayer 
              playbackId={selectedEvent.video_playback_id}
              className="w-full aspect-video rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {console.log('Selected Event:', selectedEvent)}
    </div>
  )
} 