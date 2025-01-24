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
import { VideoState, VideoStateType, VideoData } from "../../lib/video-states"

type BusinessTimelineEvent = Database["public"]["Tables"]["business_timeline_events"]["Row"]

interface VideoUploadProps {
  onSuccess: (data: VideoData) => void
  onRecordingChange?: (recording: boolean, fromStartOver?: boolean) => void
  className?: string
  maxSize?: number
  children?: React.ReactNode
}

export function VideoUpload({ 
  onSuccess, 
  onRecordingChange,
  className, 
  maxSize = 100,
  children 
}: VideoUploadProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordedVideoData, setRecordedVideoData] = useState<VideoData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRecordingSuccess = (data: VideoData) => {
    setRecordedVideoData(data)
    setIsProcessing(false)
    setHasRecordedVideo(true)
    onSuccess(data)
  }

  const handleRecordingChange = (recording: boolean, fromStartOver: boolean = false) => {
    setIsRecording(recording)
    if (!recording) {
      if (fromStartOver) {
        setHasRecordedVideo(false)
        setRecordedVideoData(null)
        setIsProcessing(false)
      } else {
        setIsProcessing(true)
      }
    }
    onRecordingChange?.(recording, fromStartOver)
  }

  return (
    <div className="flex flex-col h-full">
      {isProcessing ? (
        <VideoProcessingSkeleton />
      ) : !hasRecordedVideo ? (
        <VideoRecorder
          onSuccess={handleRecordingSuccess}
          onRecordingChange={handleRecordingChange}
          onCountdownChange={setCountdown}
        />
      ) : (
        <>
          <div className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-[280px] min-h-0 flex-1">
                <MuxVideoPlayer 
                  playbackId={recordedVideoData!.playbackId}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
          {children}
          
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