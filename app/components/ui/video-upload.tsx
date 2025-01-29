"use client"

import { useState, useRef, useEffect } from "react"
import { Video, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { VideoRecorder } from "./video-recorder"
import { MuxVideoPlayer } from "./mux-video-player"
import { Skeleton } from "@/components/ui/skeleton"
import { Database } from "@/types/database.types"

type BusinessTimelineEvent = Database["public"]["Tables"]["business_timeline_events"]["Row"]

interface VideoData {
  assetId: string
  playbackId: string
  thumbnailUrl: string
  duration: number | null
  status: string | null
}

interface VideoUploadProps {
  onSuccess: (data: VideoData) => void
  onRecordingChange?: (recording: boolean, fromStartOver?: boolean) => void
  onProcessingStart?: () => void
  className?: string
  maxSize?: number
  children?: React.ReactNode
}

export function VideoUpload(props: VideoUploadProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordedVideoData, setRecordedVideoData] = useState<VideoData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processingTimeoutRef = useRef<NodeJS.Timeout>()

  // Clear processing state if stuck for too long
  useEffect(() => {
    if (isProcessing) {
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false)
        toast.error('Video processing timed out. Please try again.')
      }, 60000) // 1 minute timeout
    }
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [isProcessing])

  const handleRecordingSuccess = (data: VideoData) => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }
    setRecordedVideoData(data)
    setIsProcessing(false)
    setHasRecordedVideo(true)
    props.onSuccess(data)
  }

  const handleRecordingChange = (recording: boolean, fromStartOver: boolean = false) => {
    setIsRecording(recording)
    if (!recording) {
      if (fromStartOver) {
        setHasRecordedVideo(false)
        setRecordedVideoData(null)
        setIsProcessing(false)
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current)
        }
      } else {
        setIsProcessing(true)
        props.onProcessingStart?.()
      }
    }
    props.onRecordingChange?.(recording, fromStartOver)
  }

  return (
    <div className="flex flex-col h-full">
      {!isProcessing && !recordedVideoData && (
        <VideoRecorder
          onSuccess={handleRecordingSuccess}
          onRecordingChange={handleRecordingChange}
          onCountdownChange={setCountdown}
        />
      )}
      
      {isProcessing && (
        <div className="flex-1">
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-[280px] min-h-0 flex-1">
              <div className="aspect-[9/16] relative overflow-hidden rounded-lg">
                <Skeleton className="absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {recordedVideoData && !isProcessing && (
        <>
          <div className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-[280px] min-h-0 flex-1">
                <MuxVideoPlayer 
                  playbackId={recordedVideoData.playbackId}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
          {props.children}
          
          {!isRecording && !hasRecordedVideo && !countdown && (
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