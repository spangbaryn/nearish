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
  controls?: boolean
  hidePlayButton?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  color?: string
}

export function MuxVideoPlayer({ 
  playbackId, 
  className, 
  autoPlay, 
  onEnded,
  controls = true,
  hidePlayButton = false,
  loop = false,
  muted = false,
  preload = 'metadata',
  color = "#000000"
}: MuxVideoPlayerProps) {
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
      
      if (hidePlayButton) {
        playerRef.current.style.setProperty('--play-button', 'none');
        playerRef.current.style.setProperty('--media-play-button-display', 'none');
        playerRef.current.style.setProperty('--controls', 'none');
        playerRef.current.style.setProperty('--media-controls-display', 'none');
      }
    }
  }, [hidePlayButton]);
  
  return (
    <div className="aspect-[9/16] relative overflow-hidden rounded-lg bg-gray-200 h-full max-h-[70vh]">
      <div 
        className="absolute inset-0 blur-3xl opacity-40 z-0"
        style={{
          backgroundColor: color,
          backgroundImage: `
            linear-gradient(45deg, ${color} 25%, transparent 25%),
            linear-gradient(-45deg, ${color} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${color} 75%),
            linear-gradient(-45deg, transparent 75%, ${color} 75%),
            radial-gradient(circle at 50% 50%, ${color}, transparent 70%)
          `,
          backgroundSize: '100px 100px, 100px 100px, 100px 100px, 100px 100px, cover',
          backgroundPosition: '0 0, 0 50px, 50px -50px, -50px 0px, center center',
          animation: 'gradient-shift 8s linear infinite'
        }}
      />
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        streamType="on-demand"
        className={cn("absolute inset-0 min-h-full min-w-full z-10", className)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...{
            '--play-button': 'none',
            '--media-play-button-display': 'none',
            '--controls': 'none',
            '--media-controls-display': 'none',
            '--media-background': 'transparent',
            '--media-background-color': 'transparent',
            '--controls-backdrop-color': 'transparent',
            '--poster-background': 'transparent',
            '--media-poster-display': 'none'
          } as React.CSSProperties
        }}
        autoPlay={autoPlay}
        muted={muted}
        onEnded={onEnded}
        thumbnailTime={0}
        defaultHiddenCaptions
        nohotkeys={!controls}
        loop={loop}
        preload={preload}
      />
    </div>
  )
} 