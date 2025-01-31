"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TimelineEventOverlay } from "./timeline-event-overlay"
import { Database } from "@/types/database.types"
import { MuxVideoPlayer } from "./mux-video-player"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EditTimelineEventDialog } from "./edit-timeline-event-dialog"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EmptyTimelineCard } from "./empty-timeline-card"

type Profile = {
  avatar_url: string | null;
  created_at: string | null;
  email: string;
  first_name: string | null;
  id: string;
  last_name: string | null;
  onboarded: boolean;
  role: string;
  updated_at: string | null;
  zip_code: string | null;
}

type TimelineEvent = {
  business_id: string;
  created_at: string | null;
  created_by: Profile | undefined;
  date: string;
  description: string | null;
  id: string;
  thumbnail_url: string | null;
  title: string;
  updated_at: string | null;
  video_asset_id: string | null;
  video_duration: number | null;
  video_playback_id: string | null;
  video_status: string | null;
}

interface BusinessTimelineProps {
  businessId: string
  events: TimelineEvent[]
  color?: string
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
  const queryClient = useQueryClient()
  const [isHovering, setIsHovering] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const searchParams = useSearchParams()
  const scrollToEventId = searchParams.get('scrollToEvent')
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null)

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from('business_timeline_events')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['business-timeline'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete event")
    }
  })

  const checkScrollPosition = () => {
    if (!timelineRef.current) return
    const container = timelineRef.current
    
    // Check if we're at the start
    setIsAtStart(container.scrollLeft <= 0)
    
    // Check if we're at the end
    const isEnd = Math.abs(
      container.scrollWidth - container.clientWidth - container.scrollLeft
    ) < 1
    setIsAtEnd(isEnd)
  }

  useEffect(() => {
    if (timelineRef.current) {
      const checkScroll = () => {
        const container = timelineRef.current
        if (container) {
          setCanScroll(container.scrollWidth > container.clientWidth)
          checkScrollPosition()
        }
      }
      
      checkScroll()
      timelineRef.current.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScroll)
      return () => {
        timelineRef.current?.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [events])

  useEffect(() => {
    if (scrollToEventId && timelineRef.current) {
      const eventElement = document.querySelector(`[data-event-id="${scrollToEventId}"]`)
      if (eventElement) {
        eventElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        })
      }
    }
  }, [scrollToEventId, events])

  useEffect(() => {
    if (scrollToEventId) {
      setHighlightedEventId(scrollToEventId)
      const timer = setTimeout(() => {
        setHighlightedEventId(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [scrollToEventId])

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

  const handleDelete = async (eventId: string) => {
    // Add your delete logic here
    // You might want to show a confirmation dialog before deleting
    router.push(`/timeline/${eventId}/delete`)
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div>
      <div className="w-full">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div 
              className="h-8 w-1 rounded-full"
              style={{ background: color }}
            />
            <h2 className="text-2xl font-bold text-black">
              Our Story
            </h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/timeline/new?businessId=${businessId}`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="timeline-wrapper">
          <div className="storybook-timeline bg-muted/50 rounded-none sm:rounded-xl sm:border border-border -mx-4 sm:mx-0 overflow-hidden"
            style={{ 
              color: color,
              '--timeline-color-rgb': `${hexToRgb(color)}`,
              '--timeline-color': color
            } as React.CSSProperties}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {events.length === 0 ? (
              <EmptyTimelineCard businessId={businessId} />
            ) : (
              <div className="w-full">
                <div className="relative">
                  <div className="timeline-connector" />
                  <div 
                    ref={timelineRef}
                    className="flex gap-3 overflow-x-auto overflow-y-visible py-16 px-2 sm:px-8 cursor-grab active:cursor-grabbing select-none scroll-smooth"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    {sortedEvents.map((event, index) => (
                      <div 
                        key={event.id} 
                        data-event-id={event.id}
                        className="relative"
                      >
                        {shouldShowYear(event, index) && (
                          <div className="timeline-year">
                            {new Date(event.date).getFullYear()}
                          </div>
                        )}
                        <div className={cn(
                          "timeline-card-container",
                          index % 2 === 0 ? "offset-up" : "offset-down"
                        )}>
                          <Card 
                            className={cn(
                              "timeline-card w-[180px] sm:min-w-[200px] cursor-pointer transition-all duration-300 relative group hover:shadow-lg bg-white z-10 border-2 hover:border-primary/20",
                              highlightedEventId === event.id && "ring-2 ring-primary ring-offset-2"
                            )}
                            onClick={(e) => handleCardClick(e, event)}
                          >
                            <CardContent className="p-4 pb-10 relative">
                              {/* Simple separator line instead of gradient */}
                              <div className="absolute inset-x-0 top-0 h-px bg-border" />
                              
                              {/* Add dropdown menu button */}
                              <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 edit-button opacity-0 group-hover:opacity-100 transition-opacity dropdown-trigger"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/timeline/${event.id}/edit`)
                                    }}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive" 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm("Are you sure you want to delete this event?")) {
                                          deleteEventMutation.mutate(event.id)
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

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
                                    src={event.created_by?.avatar_url || undefined} 
                                    alt={event.created_by?.first_name || 'User'} 
                                  />
                                  <AvatarFallback>
                                    {event.created_by?.first_name?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {canScroll && isHovering && !isAtStart && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 shadow-md"
                      onClick={() => scrollTimeline('left')}
                    >
                      <ChevronLeft className="h-4 w-4" style={{ color: color }} />
                    </Button>
                  )}
                  
                  {canScroll && isHovering && !isAtEnd && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 shadow-md"
                      onClick={() => scrollTimeline('right')}
                    >
                      <ChevronRight className="h-4 w-4" style={{ color: color }} />
                    </Button>
                  )}
                </div>
              </div>
            )}
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