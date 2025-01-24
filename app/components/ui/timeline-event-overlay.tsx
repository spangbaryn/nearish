"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MuxVideoPlayer } from "./mux-video-player"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TimelineEventOverlayProps {
  events: Array<{
    id: string
    title: string
    date: string
    video_playback_id?: string
    description?: string
  }>
  currentEventId: string
  onClose: () => void
  onEventChange: (eventId: string) => void
}

export function TimelineEventOverlay({ events, currentEventId, onClose, onEventChange }: TimelineEventOverlayProps) {
  const currentIndex = events.findIndex(e => e.id === currentEventId)
  const currentEvent = events[currentIndex]
  const [isVideoEnded, setIsVideoEnded] = useState(false)

  useEffect(() => {
    // Save the original margin
    const originalMargin = document.body.style.margin
    
    // Remove margin and prevent scroll
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Restore original styles
      document.body.style.margin = originalMargin
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleVideoEnded = () => {
    const nextIndex = (currentIndex + 1) % events.length
    onEventChange(events[nextIndex].id)
  }

  return (
    <div 
      className="fixed inset-0 bg-background z-[9999] flex flex-col m-0"
      aria-modal="true"
      role="dialog"
      style={{ 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        margin: 0
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-background/50 backdrop-blur-sm">
        <Image
          src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
          alt="Nearish Logo"
          width={240}
          height={70}
          className="h-20 w-auto"
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 z-10"
          onClick={() => {
            const prevIndex = (currentIndex - 1 + events.length) % events.length
            onEventChange(events[prevIndex].id)
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Video Player */}
        <div className="w-full h-full flex flex-col justify-center px-4 py-8">
          <div className="flex-1 flex items-center justify-center min-h-0">
            {currentEvent.video_playback_id && (
              <MuxVideoPlayer 
                playbackId={currentEvent.video_playback_id}
                autoPlay={true}
                onEnded={handleVideoEnded}
              />
            )}
          </div>
          <div className="max-w-2xl mx-auto w-full mt-8 px-4">
            <div className="bg-background/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold">{currentEvent.title}</h3>
                <time className="text-sm text-muted-foreground/80">
                  {new Date(currentEvent.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
              {currentEvent.description && (
                <p className="mt-3 text-muted-foreground/90 leading-relaxed">
                  {currentEvent.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 z-10"
          onClick={() => {
            const nextIndex = (currentIndex + 1) % events.length
            onEventChange(events[nextIndex].id)
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
} 