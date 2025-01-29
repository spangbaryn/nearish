import { useState } from "react"
import { videoStateSchema, type VideoState, type VideoEvent } from "../schemas/video.schema"

export function useVideoState(initialEvents: VideoEvent[]) {
  const [state, setState] = useState<VideoState>(() => 
    videoStateSchema.parse({
      isVideoEnded: false,
      isTransitioning: false,
      currentIndex: 0,
      events: initialEvents,
    })
  )

  const updateState = (updates: Partial<VideoState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }
      return videoStateSchema.parse(newState)
    })
  }

  return {
    state,
    updateState,
  }
} 