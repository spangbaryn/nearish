"use client"

import { useEffect, useState, forwardRef, ForwardedRef } from "react"
import dynamic from 'next/dynamic'
import { cn } from "@/lib/utils"
import { useVideoState } from "@/lib/hooks/use-video-state"
import { MuxService } from "@/lib/services/mux.service"
import { useRef } from "react"
import { toast } from "sonner"
import { Play } from "lucide-react"
import Hls from 'hls.js'

interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  type: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// Dynamically import the video player to avoid SSR
const MuxPlayerComponent = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => null
  }
)

interface MuxVideoPlayerProps {
  playbackId: string
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
  controls?: boolean
  hidePlayButton?: boolean
  loop?: boolean
  muted?: boolean
  preload?: "auto" | "metadata" | "none"
  color?: string
  playsInline?: boolean
  startTime?: number
  streamType?: "on-demand" | "live"
  preferPlayback?: string
  onError?: (error: any) => void
  disableToggle?: boolean
  onTimeUpdate?: (evt: Event) => void
  onLoadedMetadata?: (evt: Event) => void
  onPausedChange?: (isPaused: boolean) => void
}

export const MuxVideoPlayer = forwardRef((props: MuxVideoPlayerProps, ref: ForwardedRef<any>) => {
  const playerRef = useRef<any>(null)
  const [hls, setHls] = useState<Hls | null>(null)
  const [sourceUrl] = useState(`https://stream.mux.com/${props.playbackId}.m3u8`)
  const [hasMounted, setHasMounted] = useState(false)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (playerRef.current && hasMounted) {
      MuxService.setPlayerStyles(playerRef.current)
    }
  }, [hasMounted])

  useEffect(() => {
    if (playerRef.current) {
      MuxService.setPlayerStyles(playerRef.current)
      const mediaEl = playerRef.current.querySelector("mux-video")
      if (mediaEl) {
        const mediaStyle = (mediaEl as HTMLElement).style as CSSStyleDeclaration
        mediaStyle.objectFit = "cover"
        mediaStyle.width = "100%"
        mediaStyle.height = "100%"

        const videoEl = mediaEl as HTMLVideoElement
        let animationFrameId: number
        let lastTime = 0

        const updateTime = () => {
          const now = performance.now()
          if (props.onTimeUpdate && !videoEl.paused && now - lastTime >= 16) {
            props.onTimeUpdate({ target: videoEl } as unknown as Event)
            lastTime = now
          }
          animationFrameId = requestAnimationFrame(updateTime)
        }

        animationFrameId = requestAnimationFrame(updateTime)

        return () => {
          cancelAnimationFrame(animationFrameId)
        }
      }

      if (props.hidePlayButton) {
        playerRef.current.style.setProperty("--play-button", "none")
        playerRef.current.style.setProperty("--media-play-button-display", "none")
        playerRef.current.style.setProperty("--controls", "none")
        playerRef.current.style.setProperty("--media-controls-display", "none")
      }
    }
  }, [props.hidePlayButton, props.onTimeUpdate, hasMounted])

  useEffect(() => {
    return () => {
      if (playerRef.current && !document.body.contains(playerRef.current)) {
        const mediaEl = playerRef.current.querySelector("mux-video") as HTMLVideoElement
        if (mediaEl && typeof mediaEl.pause === 'function') {
          mediaEl.pause()
          mediaEl.src = ""
          mediaEl.load()
        }
        playerRef.current.remove()
      }
    }
  }, [hasMounted])

  useEffect(() => {
    const videoEl = playerRef.current?.querySelector("mux-video") as HTMLVideoElement | null
    if (videoEl && props.playbackId) {
      videoEl.src = sourceUrl
      videoEl.load()
    }
  }, [props.playbackId, sourceUrl, hasMounted])

  const useNetworkQuality = () => {
    const [quality, setQuality] = useState(() => MuxService.getInitialQuality());

    useEffect(() => {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (!connection) return;

      const handleConnectionChange = () => {
        setQuality(MuxService.getInitialQuality());
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }, []);

    return quality;
  };

  useEffect(() => {
    const videoEl = playerRef.current?.querySelector("mux-video") as HTMLVideoElement | null
    if (videoEl && Hls.isSupported()) {
      const { targetHeight } = useNetworkQuality();
      const hlsInstance = new Hls(MuxService.getHlsConfig()) as Hls & { destroy: () => void }
      setHls(hlsInstance)
      
      hlsInstance.loadSource(sourceUrl)
      hlsInstance.attachMedia(videoEl)

      hlsInstance.on(Hls.Events.ERROR, (event, data: { fatal?: boolean; type?: string; details?: string }) => {
        if (data.fatal && data.type) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsInstance.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsInstance.recoverMediaError()
              break
            default:
              hlsInstance.destroy()
              break
          }
        }
        
        if (props.onError && data.fatal && data.details && 
            !data.details.includes('bufferNudgeOnStall') && 
            !data.details.includes('BUFFER_STALLED_ERROR')) {
          props.onError(data)
        }
      })

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels || []
        const idealLevel = levels.findIndex(level => 
          level.height && level.height <= targetHeight
        )
        
        if (idealLevel !== -1) {
          hlsInstance.currentLevel = idealLevel
          hlsInstance.loadLevel = idealLevel
          hlsInstance.nextLoadLevel = idealLevel
        }

        // Add network warning if needed
        const connection = (navigator as NavigatorWithConnection).connection;
        if (connection?.downlink && connection.downlink < 1) {
          toast.warning("Poor connection detected - video quality may be reduced");
        }
      })

      return () => {
        hlsInstance.destroy()
        setHls(null)
      }
    }
  }, [sourceUrl, props.onError, hasMounted])

  const handleTogglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const muxPlayer = playerRef.current
    if (muxPlayer) {
      if (paused) {
        try {
          await muxPlayer.play()
          setPaused(false)
          props.onPausedChange?.(false)
        } catch (err) {
          console.error("Error playing video:", err)
        }
      } else {
        muxPlayer.pause()
        setPaused(true)
        props.onPausedChange?.(true)
      }
    }
  }

  useEffect(() => {
    const muxPlayer = playerRef.current
    if (muxPlayer) {
      const handlePlay = () => {
        setPaused(false)
        props.onPausedChange?.(false)
      }
      const handlePause = () => {
        setPaused(true)
        props.onPausedChange?.(true)
      }

      muxPlayer.addEventListener("play", handlePlay)
      muxPlayer.addEventListener("pause", handlePause)

      return () => {
        muxPlayer.removeEventListener("play", handlePlay)
        muxPlayer.removeEventListener("pause", handlePause)
      }
    }
  }, [props.onPausedChange, hasMounted])

  useEffect(() => {
    const muxPlayer = playerRef.current
    if (muxPlayer) {
      const handleEnded = () => {
        console.log("Video ended event fired")
        props.onEnded?.()
      }

      const videoEl = muxPlayer.querySelector("mux-video") as HTMLVideoElement
      if (videoEl) {
        videoEl.addEventListener("ended", handleEnded)
        return () => videoEl.removeEventListener("ended", handleEnded)
      }
    }
  }, [props.onEnded, hasMounted])

  if (!hasMounted) {
    return null
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MuxPlayerComponent
        ref={ref}
        playbackId={props.playbackId}
        streamType="on-demand"
        className={cn("absolute inset-0 min-h-full min-w-full z-10", props.className)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          "--play-button": "none",
          "--media-play-button-display": "none",
          "--controls": "none",
          "--media-controls-display": "none",
          "--media-background": "transparent",
          "--media-background-color": "transparent",
          "--controls-backdrop-color": "transparent",
          "--poster-background": "transparent",
          "--media-poster-display": "none"
        } as React.CSSProperties}
        autoPlay={props.autoPlay}
        muted={props.muted}
        onEnded={props.onEnded}
        thumbnailTime={0}
        defaultHiddenCaptions
        nohotkeys={!props.controls}
        loop={props.loop}
        preload={props.preload}
        onTimeUpdate={props.onTimeUpdate}
        onLoadedMetadata={props.onLoadedMetadata}
      />
      {!props.disableToggle && (
        <div
          className="absolute inset-0 z-20"
          onClick={handleTogglePlayback}
          style={{ cursor: "pointer" }}
        />
      )}
    </div>
  )
})

MuxVideoPlayer.displayName = 'MuxVideoPlayer' 