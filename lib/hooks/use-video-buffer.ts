import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface UseVideoBufferProps {
  videoEl: HTMLVideoElement | null
  hls: Hls | null
  minBufferTime?: number
  onBufferReady?: () => void
}

export function useVideoBuffer({
  videoEl,
  hls,
  onBufferReady
}: UseVideoBufferProps) {
  const [isBuffering, setIsBuffering] = useState(true)
  const [bufferHealth, setBufferHealth] = useState(0)
  const playbackStalled = useRef(false)

  useEffect(() => {
    if (!videoEl || !hls) return

    const handleWaiting = () => {
      playbackStalled.current = true
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      playbackStalled.current = false
      setIsBuffering(false)
    }

    const handleTimeUpdate = () => {
      if (playbackStalled.current) {
        playbackStalled.current = false
        setIsBuffering(false)
      }
    }

    videoEl.addEventListener('waiting', handleWaiting)
    videoEl.addEventListener('playing', handlePlaying)
    videoEl.addEventListener('timeupdate', handleTimeUpdate)
    
    return () => {
      videoEl.removeEventListener('waiting', handleWaiting)
      videoEl.removeEventListener('playing', handlePlaying)
      videoEl.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [videoEl, hls, onBufferReady])

  return { isBuffering, bufferHealth }
} 