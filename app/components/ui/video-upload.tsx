"use client"

import { useState, useRef, useEffect } from "react"
import { Video, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { VideoRecorder } from "./video-recorder"
import { MuxVideoPlayer } from "./mux-video-player"

interface VideoUploadProps {
  onSuccess: (data: {
    assetId: string,
    playbackId: string,
    thumbnailUrl: string,
    duration: number,
    status: string
  }) => void
  onRecordingChange?: (recording: boolean) => void
  className?: string
  maxSize?: number // in MB
}

export function VideoUpload({ onSuccess, className, maxSize = 100 }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false)
  const [recordedVideoData, setRecordedVideoData] = useState<{
    playbackId: string;
    thumbnailUrl: string;
  } | null>(null)

  useEffect(() => {
    const event = new CustomEvent('recordingStateChange', { detail: isRecording })
    window.dispatchEvent(event)
  }, [isRecording])

  const handleRecordingSuccess = (data: any) => {
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

    setFileName(file.name)
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
      setFileName(null)
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {!recordedVideoData ? (
        <VideoRecorder 
          onSuccess={handleRecordingSuccess}
          onRecordingChange={setIsRecording}
        />
      ) : (
        <div className="mt-4">
          <MuxVideoPlayer 
            playbackId={recordedVideoData.playbackId}
            className="rounded-lg"
          />
        </div>
      )}
      
      {!hasRecordedVideo && (
        <>
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

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleUpload}
          />

          {isUploading && (
            <Progress value={progress} className="mt-4" />
          )}
        </>
      )}
    </div>
  )
}