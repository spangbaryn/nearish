"use client"

import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react"
import type { MuxPlayerProps } from "@mux/mux-player-react"
import { cn } from "@/lib/utils"
import { useVideoState } from "@/lib/hooks/use-video-state"
import { MuxService } from "@/lib/services/mux.service"
import { useRef, useEffect } from "react"

interface MuxVideoPlayerProps {
  playbackId: string
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export function MuxVideoPlayer({ playbackId, className, autoPlay, onEnded }: MuxVideoPlayerProps) {
  if (!playbackId) return null;
  
  const playerRef = useRef<MuxPlayerRefAttributes>(null);

  useEffect(() => {
    if (playerRef.current) {
      MuxService.setPlayerStyles(playerRef.current);
      // Force the media element to cover
      const mediaEl = playerRef.current.querySelector('mux-video');
      if (mediaEl) {
        (mediaEl as HTMLElement).style.objectFit = 'cover';
        (mediaEl as HTMLElement).style.width = '100%';
        (mediaEl as HTMLElement).style.height = '100%';
      }
    }
  }, []);
  
  return (
    <div className="aspect-[9/16] relative overflow-hidden rounded-lg bg-gray-200 h-full max-h-[70vh]">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        streamType="on-demand"
        className={cn("absolute inset-0 min-h-full min-w-full", className)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        autoPlay={autoPlay}
        onEnded={onEnded}
        thumbnailTime={0}
      />
    </div>
  )
} 