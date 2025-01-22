"use client"

import MuxPlayer from "@mux/mux-player-react"

interface MuxVideoPlayerProps {
  playbackId: string
  className?: string
}

export function MuxVideoPlayer({ playbackId, className }: MuxVideoPlayerProps) {
  return (
    <MuxPlayer
      streamType="on-demand"
      playbackId={playbackId}
      className={className}
      metadata={{
        video_title: "Timeline Event Video",
      }}
    />
  )
} 