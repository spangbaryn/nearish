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
    <div className="w-full h-full flex items-center justify-center">
      <div className="aspect-[9/16] relative w-full max-w-md max-h-[70vh] shadow-[0_0_40px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden">
        <MuxPlayer
          streamType="on-demand"
          playbackId={playbackId}
          className={cn("absolute inset-0", className)}
          metadata={{
            video_title: "Timeline Event Video",
          }}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            '--media-object-fit': 'cover',
            '--controls-backdrop-color': 'rgba(0, 0, 0, 0.4)',
            '--bottom-controls-margin': '1.5rem',
          }}
          autoPlay={autoPlay}
          onEnded={onEnded}
        />
      </div>
    </div>
  )
} 