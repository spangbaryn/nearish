"use client"

import MuxPlayer from "@mux/mux-player-react"
import { cn } from "@/lib/utils"
import { useVideoState } from "@/lib/hooks/use-video-state"
import { MuxService } from "@/lib/services/mux.service"

interface MuxVideoPlayerProps {
  playbackId: string
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export function MuxVideoPlayer(props: MuxVideoPlayerProps) {
  if (!props.playbackId) return null;
  
  const { state, updateState } = useVideoState([])
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="aspect-[9/16] relative w-full max-w-md max-h-[70vh] shadow-[0_0_40px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden">
        <MuxPlayer
          {...MuxService.getPlayerConfig(props.playbackId)}
          className={cn("absolute inset-0", props.className)}
          autoPlay={props.autoPlay}
          onEnded={() => {
            updateState({ isVideoEnded: true })
            props.onEnded?.()
          }}
        />
      </div>
    </div>
  )
} 