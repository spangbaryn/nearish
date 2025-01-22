"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Video, StopCircle } from "lucide-react"

interface VideoRecorderProps {
  onSuccess: (data: {
    assetId: string,
    playbackId: string,
    thumbnailUrl: string,
    duration: number,
    status: string
  }) => void
  onRecordingChange?: (isRecording: boolean) => void
}

export function VideoRecorder({ onSuccess, onRecordingChange }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      onRecordingChange?.(true)
    } catch (error: any) {
      toast.error('Failed to start recording')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    try {
      mediaRecorderRef.current.stop()
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject as MediaStream
        tracks?.getTracks().forEach(track => track.stop())
      }

      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'recording.webm', { type: 'video/webm' })

      const response = await fetch('/api/videos/upload', {
        method: 'POST'
      })
      
      const { uploadUrl, assetId } = await response.json()
      if (!uploadUrl || !assetId) throw new Error('Failed to get upload URL')

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file
      })

      let asset = null
      for (let i = 0; i < 10; i++) {
        const assetResponse = await fetch(`/api/videos/${assetId}`)
        if (assetResponse.ok) {
          asset = await assetResponse.json()
          if (asset.playback_id) break
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (!asset) throw new Error('Video processing timeout')

      onSuccess({
        assetId: asset.id,
        playbackId: asset.playback_id,
        thumbnailUrl: asset.thumbnail_url,
        duration: asset.duration,
        status: asset.status
      })

      setIsRecording(false)
      onRecordingChange?.(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    } catch (error: any) {
      toast.error('Failed to stop recording')
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video bg-muted rounded-lg"
      />
      <Button 
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "outline"}
      >
        {isRecording ? (
          <>
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  )
} 