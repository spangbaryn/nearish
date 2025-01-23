"use client"

import MuxPlayer from "@mux/mux-player-react"
import { cn } from "@/lib/utils"

interface MuxVideoPlayerProps {
  playbackId: string
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export function MuxVideoPlayer({ 
  playbackId, 
  className,
  autoPlay = false,
  onEnded 
}: MuxVideoPlayerProps) {
  return (
    <div className="max-w-sm mx-auto">
      <div className="aspect-[9/16] relative shadow-2xl rounded-2xl overflow-hidden">
        <MuxPlayer
          streamType="on-demand"
          playbackId={playbackId}
          className={cn("absolute inset-0 h-full w-full", className)}
          metadata={{
            video_title: "Timeline Event Video",
          }}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%"
          }}
          autoPlay={autoPlay}
          onEnded={onEnded}
        />
      </div>
    </div>
  )
} 