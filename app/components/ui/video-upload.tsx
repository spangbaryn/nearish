"use client"

import { useState, useRef, useEffect } from "react"
import { Video, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { VideoRecorder } from "./video-recorder"
import { MuxVideoPlayer } from "./mux-video-player"
import { VideoProcessingSkeleton } from "./video-processing-skeleton"
import { Database } from "@/types/database.types"

type BusinessTimelineEvent = Database["public"]["Tables"]["business_timeline_events"]["Row"]

type VideoData = {
  assetId: string
  playbackId: string
  thumbnailUrl: string
  duration: number
  status: string
}

interface VideoUploadProps {
  onSuccess: (data: VideoData) => void
  onRecordingChange?: (recording: boolean) => void
  className?: string
  maxSize?: number // in MB
}

export function VideoUpload({ onSuccess, onRecordingChange = () => {}, className, maxSize = 100 }: VideoUploadProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordedVideoData, setRecordedVideoData] = useState<VideoData | null>(null)
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const event = new CustomEvent('recordingStateChange', { detail: isRecording })
    window.dispatchEvent(event)
  }, [isRecording])

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording)
    onRecordingChange?.(recording)
    if (!recording) {
      setIsProcessing(true)
    }
  }

  const handleRecordingSuccess = (data: VideoData) => {
    setIsProcessing(false)
    setHasRecordedVideo(true)
    setRecordedVideoData(data)
    onSuccess(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.uploadUrl || !data.assetId) {
        throw new Error(data.error || 'Failed to get upload URL')
      }
      
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video')
      }

      let asset = null
      for (let i = 0; i < 10; i++) {
        const assetResponse = await fetch(`/api/videos/${data.assetId}`)
        if (assetResponse.ok) {
          const assetData = await assetResponse.json()
          if (assetData.playback_id) {
            asset = assetData
            break
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (!asset) {
        throw new Error('Timeout waiting for video processing')
      }
      
      onSuccess({
        assetId: asset.id,
        playbackId: asset.playback_id,
        thumbnailUrl: asset.thumbnail_url,
        duration: asset.duration,
        status: asset.status
      })
      
      toast.success('Video uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload video')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {isProcessing ? (
        <VideoProcessingSkeleton />
      ) : (
        <>
          {!recordedVideoData ? (
            <VideoRecorder 
              onSuccess={handleRecordingSuccess}
              onRecordingChange={handleRecordingChange}
            />
          ) : (
            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[280px]">
                  <MuxVideoPlayer 
                    playbackId={recordedVideoData.playbackId}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
          
          {!hasRecordedVideo && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    or{" "}
                    <span 
                      className="text-secondary cursor-pointer hover:underline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      upload a video
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}