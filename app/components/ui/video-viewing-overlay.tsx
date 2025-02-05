"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MuxVideoPlayer } from "./mux-video-player"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { VideoInteractiveOverlay } from "./VideoInteractiveOverlay"
import { Database } from "@/types/database.types"
import { createPortal } from 'react-dom'

const VideoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  video_playback_id: z.string(),
  video_asset_id: z.string().optional(),
  thumbnail_url: z.string().optional(),
  date: z.string().optional(),
  media_url: z.string().optional(),
})

export type VideoItem = z.infer<typeof VideoItemSchema>

const transformToVideoItem = (
  input: Database["public"]["Tables"]["business_staff_intros"]["Row"] |
         Database["public"]["Tables"]["business_timeline_events"]["Row"]
): VideoItem => {
  if ("first_name" in input) {
    return {
      id: input.id,
      title: input.first_name,
      subtitle: input.role,
      description: input.favorite_spot || undefined,
      video_playback_id: input.video_playback_id,
      video_asset_id: input.video_asset_id,
      thumbnail_url: input.thumbnail_url
    }
  } else {
    const formatDate = (dateStr?: string): string | undefined => {
      if (!dateStr) return undefined
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }
    const event = input as Database["public"]["Tables"]["business_timeline_events"]["Row"]
    return {
      id: event.id,
      title: event.title,
      subtitle: formatDate(event.date),
      description: event.description,
      video_playback_id: event.media_url || "",
      media_url: event.media_url || undefined
    }
  }
}

interface VideoViewingOverlayProps {
  items: VideoItem[]
  currentId?: string
  onClose: () => void
  onItemChange?: (id: string) => void
  showHeader?: boolean
  color?: string
}

export function VideoViewingOverlay({ items, currentId, onClose, onItemChange, showHeader = true, color = "#000000" }: VideoViewingOverlayProps) {
  const playerRef = useRef<any>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize currentIndex based on currentId. If not found, default to 0.
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = items.findIndex(item => item.id === currentId)
    return index !== -1 ? index : 0
  })
  const currentItem = items[currentIndex]

  // Centralized helper to update current index and notify parent.
  const updateIndex = (newIndex: number) => {
    setCurrentIndex(newIndex)
    onItemChange?.(items[newIndex].id)
  }

  const handleToggleMute = () => setIsMuted(prev => !prev)

  const handleTogglePlay = () => {
    const muxPlayer = playerRef.current
    if (muxPlayer) {
      if (isPaused) {
        muxPlayer.play()
      } else {
        muxPlayer.pause()
      }
    }
  }

  const handlePrev = () => {
    if (items.length > 1) updateIndex((currentIndex - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    if (items.length > 1) updateIndex((currentIndex + 1) % items.length)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentItem.title,
        text: currentItem.description,
        url: window.location.href
      }).catch(console.error)
    }
  }

  // On video end, simply advance to the next video if multiple items exist.
  const handleVideoEnded = () => {
    if (items.length > 1) updateIndex((currentIndex + 1) % items.length)
  }

  const onOpenFullscreen = () => {
    const container = document.getElementById("fullscreenVideoContainer")
    container?.requestFullscreen?.()
  }

  // Lock body scroll while modal is open.
  useEffect(() => {
    document.body.style.margin = "0"
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Simplified and consolidated keyboard event handler.
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          handleTogglePlay()
          break
        case "m":
          handleToggleMute()
          break
        case "ArrowLeft":
          if (items.length > 1) handlePrev()
          break
        case "ArrowRight":
          if (items.length > 1) handleNext()
          break
        case "f":
          onOpenFullscreen()
          break
        case "Escape":
          onClose()
          break
      }
    }
    window.addEventListener("keydown", onKeyPress)
    return () => window.removeEventListener("keydown", onKeyPress)
  }, [items.length, onClose, currentIndex])

  const handleVideoError = (error: any) => {
    setError(new Error(error.message || "Failed to load video"))
    toast.error("Failed to load video. Please try again.")
  }

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const overlay = (
    <div 
      className="fixed inset-0 bg-background flex flex-col" 
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0
      }} 
      aria-modal="true" 
      role="dialog"
    >
      {showHeader && (
        <div className="sticky top-0 flex justify-between items-center p-4 bg-background/50 backdrop-blur-sm">
          <Image
            src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
            alt="Nearish Logo"
            width={240}
            height={70}
            className="h-20 w-auto"
            priority
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        <div 
          id="fullscreenVideoContainer" 
          className="relative w-[95%] md:w-full max-w-md aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 -mt-6 md:mt-0"
        >
          <MuxVideoPlayer
            ref={playerRef}
            playbackId={currentItem.video_playback_id}
            autoPlay
            color={color}
            className="w-full h-full"
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            onTimeUpdate={(e: Event) => {
              const video = e.target as HTMLVideoElement
              setCurrentTime(video.currentTime || 0)
            }}
            onLoadedMetadata={(e: Event) => {
              const video = e.target as HTMLVideoElement
              setDuration(video.duration || 0)
            }}
            muted={isMuted}
            controls={false}
            onPausedChange={setIsPaused}
            disableToggle
          />
          <VideoInteractiveOverlay
            className="absolute inset-0 w-full h-full"
            isMuted={isMuted}
            isPaused={isPaused}
            currentTime={currentTime}
            duration={duration}
            header={currentItem.title}
            subheader={currentItem.subtitle}
            onToggleMute={handleToggleMute}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  )

  return mounted ? createPortal(overlay, document.body) : null
}