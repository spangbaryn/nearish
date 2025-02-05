"use client"

import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react"
import type { MuxPlayerProps } from "@mux/mux-player-react"
import { cn } from "@/lib/utils"
import { useVideoState } from "@/lib/hooks/use-video-state"
import { MuxService } from "@/lib/services/mux.service"
import { useRef, useEffect, useState, forwardRef, ForwardedRef } from "react"
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

export const MuxVideoPlayer = forwardRef(
  (
    {
      playbackId,
      className,
      autoPlay = true,
      onEnded,
      controls = true,
      hidePlayButton = false,
      loop = false,
      muted = false,
      preload = "metadata",
      color = "#000000",
      onError,
      onTimeUpdate,
      onLoadedMetadata,
      onPausedChange,
      disableToggle = false
    }: MuxVideoPlayerProps,
    ref: ForwardedRef<MuxPlayerRefAttributes>
  ) => {
    if (!playbackId) return null

    const playerRef = useRef<MuxPlayerRefAttributes | null>(null)
    const sourceUrl = `https://stream.mux.com/${playbackId}.m3u8`
    const [paused, setPaused] = useState(!autoPlay)

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
            if (onTimeUpdate && !videoEl.paused && now - lastTime >= 16) {
              onTimeUpdate({ target: videoEl } as unknown as Event)
              lastTime = now
            }
            animationFrameId = requestAnimationFrame(updateTime)
          }

          animationFrameId = requestAnimationFrame(updateTime)

          return () => {
            cancelAnimationFrame(animationFrameId)
          }
        }

        if (hidePlayButton) {
          playerRef.current.style.setProperty("--play-button", "none")
          playerRef.current.style.setProperty("--media-play-button-display", "none")
          playerRef.current.style.setProperty("--controls", "none")
          playerRef.current.style.setProperty("--media-controls-display", "none")
        }
      }
    }, [hidePlayButton, onTimeUpdate])

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
    }, [])

    useEffect(() => {
      const videoEl = playerRef.current?.querySelector("mux-video") as HTMLVideoElement | null
      if (videoEl && playbackId) {
        videoEl.src = sourceUrl
        videoEl.load()
      }
    }, [playbackId, sourceUrl])

    useEffect(() => {
      const videoEl = playerRef.current?.querySelector("mux-video") as HTMLVideoElement | null
      if (videoEl && Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(sourceUrl)
        hls.attachMedia(videoEl)

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                toast.error("A network error occurred during video playback. Retrying...")
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                toast.error("A media error occurred during video playback. Attempting recovery...")
                hls.recoverMediaError()
                break
              default:
                toast.error("A fatal error occurred during video playback. Please refresh the page.")
                hls.destroy()
                break
            }
          }
          if (onError) {
            onError(data)
          }
        })

        return () => {
          hls.destroy()
        }
      }
    }, [sourceUrl, onError])

    const handleTogglePlayback = async (e: React.MouseEvent) => {
      e.stopPropagation()
      const muxPlayer = playerRef.current
      if (muxPlayer) {
        if (paused) {
          try {
            await muxPlayer.play()
            setPaused(false)
            onPausedChange?.(false)
          } catch (err) {
            console.error("Error playing video:", err)
          }
        } else {
          muxPlayer.pause()
          setPaused(true)
          onPausedChange?.(true)
        }
      }
    }

    useEffect(() => {
      const muxPlayer = playerRef.current
      if (muxPlayer) {
        const handlePlay = () => {
          setPaused(false)
          onPausedChange?.(false)
        }
        const handlePause = () => {
          setPaused(true)
          onPausedChange?.(true)
        }

        muxPlayer.addEventListener("play", handlePlay)
        muxPlayer.addEventListener("pause", handlePause)

        return () => {
          muxPlayer.removeEventListener("play", handlePlay)
          muxPlayer.removeEventListener("pause", handlePause)
        }
      }
    }, [onPausedChange])

    useEffect(() => {
      const muxPlayer = playerRef.current
      if (muxPlayer) {
        const handleEnded = () => {
          console.log("Video ended event fired")
          onEnded?.()
        }

        const videoEl = muxPlayer.querySelector("mux-video") as HTMLVideoElement
        if (videoEl) {
          videoEl.addEventListener("ended", handleEnded)
          return () => videoEl.removeEventListener("ended", handleEnded)
        }
      }
    }, [onEnded])

    return (
      <div className="relative w-full h-full overflow-hidden">
        <MuxPlayer
          ref={(el) => {
            playerRef.current = el
            if (typeof ref === "function") {
              ref(el)
            } else if (ref) {
              ref.current = el
            }
          }}
          playbackId={playbackId}
          streamType="on-demand"
          className={cn("absolute inset-0 min-h-full min-w-full z-10", className)}
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
          autoPlay={autoPlay}
          muted={muted}
          onEnded={onEnded}
          thumbnailTime={0}
          defaultHiddenCaptions
          nohotkeys={!controls}
          loop={loop}
          preload={preload}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
        {!disableToggle && (
          <div
            className="absolute inset-0 z-20"
            onClick={handleTogglePlayback}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>
    )
  }
) 