"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TimelineEventOverlay } from "./timeline-event-overlay"
import { Database } from "@/types/database.types"
import { MuxVideoPlayer } from "./mux-video-player"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EditTimelineEventDialog } from "./edit-timeline-event-dialog"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  full_name?: string | null
}

type TimelineEvent = Database['public']['Tables']['business_timeline_events']['Row'] & {
  created_by: Profile
  video_asset_id?: string | null
  video_playback_id?: string | null
  thumbnail_url?: string | null
  video_duration?: number | null
  video_status?: string | null
  description?: string | null
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 0, 0';
}

export function BusinessTimeline({ 
  businessId, 
  events,
  color = "#000000"
}: { 
  businessId: string, 
  events: TimelineEvent[]
  color?: string 
}) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const dragThreshold = 5 // pixels to move before considering it a drag
  const [dragDistance, setDragDistance] = useState(0)
  const router = useRouter()

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (timelineRef.current?.offsetLeft || 0))
    setScrollLeft(timelineRef.current?.scrollLeft || 0)
    setDragDistance(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (timelineRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    setDragDistance(Math.abs(walk))
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleCardClick = (e: React.MouseEvent, event: TimelineEvent) => {
    if (dragDistance > dragThreshold) {
      // If we've dragged more than the threshold, prevent the click
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setSelectedEvent(event)
  }

  const shouldShowYear = (event: TimelineEvent, index: number) => {
    const currentYear = new Date(event.date).getFullYear()
    if (index === 0) return true
    
    const prevYear = new Date(events[index - 1].date).getFullYear()
    return currentYear !== prevYear
  }

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return
    
    const container = timelineRef.current
    const cardWidth = 200 // min-w-[200px] from card class
    const gap = 16 // gap-4 = 1rem = 16px
    const visibleWidth = container.clientWidth
    const scrollAmount = Math.floor(visibleWidth / (cardWidth + gap)) * (cardWidth + gap)
    
    const newScrollLeft = direction === 'right' 
      ? container.scrollLeft + scrollAmount
      : container.scrollLeft - scrollAmount
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  if (!events?.length) {
    return (
      <div className="timeline-section">
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/timeline/new?businessId=${businessId}`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
          <div className="storybook-timeline">
            <div className="p-8">
              <p className="text-muted-foreground text-center">No events yet</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="timeline-section">
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/timeline/new?businessId=${businessId}`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
        
        <div className="storybook-timeline" style={{ 
          color: color,
          '--timeline-color-rgb': `${hexToRgb(color)}`,
          '--timeline-color': color
        } as React.CSSProperties}>
          <div className="relative">
            <div className="timeline-connector" />
            
            {/* Left Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 shadow-md"
              onClick={() => scrollTimeline('left')}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: color }} />
            </Button>

            <div 
              ref={timelineRef}
              className="flex gap-4 overflow-x-auto overflow-y-hidden py-16 px-8 cursor-grab active:cursor-grabbing select-none scroll-smooth"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  {shouldShowYear(event, index) && (
                    <div className="absolute bottom-[-3rem] left-0 text-2xl font-bold text-muted-foreground/20">
                      {new Date(event.date).getFullYear()}
                    </div>
                  )}
                  <div className={cn(
                    "timeline-card-container",
                    index % 2 === 0 ? "offset-up" : "offset-down"
                  )}>
                    <Card 
                      className="timeline-card min-w-[200px] cursor-pointer transition-colors relative group hover:shadow-lg bg-white z-10 border-2 hover:border-primary/20"
                      onClick={(e) => handleCardClick(e, event)}
                    >
                      <CardContent className="p-4 pb-10 relative">
                        {/* Add a subtle gradient overlay at the top */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg" />
                        
                        <h3 className="font-semibold text-card-foreground">{event.title}</h3>
                        <time className="text-xs text-muted-foreground/60 block mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </time>
                        {event.thumbnail_url && (
                          <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md ring-1 ring-black/5">
                            <Image
                              src={event.thumbnail_url}
                              alt={`Thumbnail for ${event.title}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2">
                          <Avatar className="h-6 w-6 ring-2 ring-background">
                            <AvatarImage 
                              src={event.created_by.avatar_url || undefined} 
                              alt={event.created_by.full_name || 'User'} 
                            />
                            <AvatarFallback>
                              {event.created_by.full_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 shadow-md"
              onClick={() => scrollTimeline('right')}
            >
              <ChevronRight className="h-4 w-4" style={{ color: color }} />
            </Button>
          </div>
        </div>

        {selectedEvent && (
          <TimelineEventOverlay 
            events={sortedEvents
              .filter(e => e.video_playback_id)
              .map(e => ({
                id: e.id,
                title: e.title,
                date: e.date,
                video_playback_id: e.video_playback_id || undefined,
                description: e.description || undefined
              }))}
            currentEventId={selectedEvent.id}
            onClose={() => setSelectedEvent(null)}
            onEventChange={(eventId) => {
              const newEvent = events.find(e => e.id === eventId)
              if (newEvent) setSelectedEvent(newEvent)
            }}
          />
        )}
      </div>
    </div>
  )
} 