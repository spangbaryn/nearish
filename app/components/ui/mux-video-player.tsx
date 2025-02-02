"use client"

import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react"
import type { MuxPlayerProps } from "@mux/mux-player-react"
import { cn } from "@/lib/utils"
import { useVideoState } from "@/lib/hooks/use-video-state"
import { MuxService } from "@/lib/services/mux.service"
import { useRef, useEffect, useState } from "react"
import Hls from "hls.js"
import { toast } from "sonner"
import { Play } from "lucide-react"

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
  playsInline?: boolean
  startTime?: number
  streamType?: 'on-demand' | 'live'
  preferPlayback?: string
  onError?: (error: any) => void
  disableToggle?: boolean
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
  color = "#000000",
  onError,
  disableToggle = false
}: MuxVideoPlayerProps) {
  if (!playbackId) return null;
  
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (playerRef.current) {
      MuxService.setPlayerStyles(playerRef.current);
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
  
  useEffect(() => {
    return () => {
      if (playerRef.current && !document.body.contains(playerRef.current)) {
        const mediaEl = playerRef.current.querySelector('mux-video');
        if (mediaEl) {
          (mediaEl as HTMLVideoElement).pause();
          (mediaEl as HTMLVideoElement).src = '';
          (mediaEl as HTMLVideoElement).load();
        }
        playerRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(sourceUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              toast.error("A network error occurred during video playback. Retrying...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              toast.error("A media error occurred during video playback. Attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              toast.error("A fatal error occurred during video playback. Please refresh the page.");
              hls.destroy();
              break;
          }
        }
        if (onError) {
          onError(data);
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [sourceUrl, onError]);
  
  const handleTogglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const muxPlayer = playerRef.current as any;
    if (muxPlayer) {
      if (muxPlayer.paused) {
        try {
          await muxPlayer.play();
          setPaused(false);
        } catch (err) {
          console.error("Error playing video:", err);
        }
      } else {
        muxPlayer.pause();
        setPaused(true);
      }
    }
  };

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
          '--play-button': 'none',
          '--media-play-button-display': 'none',
          '--controls': 'none',
          '--media-controls-display': 'none',
          '--media-background': 'transparent',
          '--media-background-color': 'transparent',
          '--controls-backdrop-color': 'transparent',
          '--poster-background': 'transparent',
          '--media-poster-display': 'none'
        } as React.CSSProperties}
        autoPlay={autoPlay}
        muted={muted}
        onEnded={onEnded}
        thumbnailTime={0}
        defaultHiddenCaptions
        nohotkeys={!controls}
        loop={loop}
        preload={preload}
      />
      
      {/* Only render the click-capturing overlay if toggle behavior is enabled */}
      {!disableToggle && (
        <div 
          className="absolute inset-0 z-20" 
          onClick={handleTogglePlayback}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
    </div>
  )
} 