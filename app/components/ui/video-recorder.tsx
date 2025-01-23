"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Video, StopCircle, Settings } from "lucide-react"
import { MuxVideoPlayer } from "./mux-video-player"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VideoProcessingSkeleton } from "./video-processing-skeleton"

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

interface MediaDevice {
  deviceId: string
  label: string
}

export function VideoRecorder({ onSuccess, onRecordingChange }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<{
    playbackId: string;
    thumbnailUrl: string;
  } | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedAudio, setSelectedAudio] = useState<string>('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!isRecording && !isProcessing && !recordedVideo) {
      getMediaDevices()
    }
    
    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks()
        tracks?.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [])

  useEffect(() => {
    if (selectedVideo || selectedAudio) {
      if (!isRecording && !isProcessing && !recordedVideo) {
        initializeCamera()
      }
    }
  }, [selectedVideo, selectedAudio, isRecording, isProcessing, recordedVideo])

  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
        }))
      
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`
        }))

      setVideoDevices(videoInputs)
      setAudioDevices(audioInputs)
      
      const defaultVideo = videoInputs.find(device => device.deviceId === 'default') || videoInputs[0]
      const defaultAudio = audioInputs.find(device => device.deviceId === 'default') || audioInputs[0]
      
      if (defaultVideo) setSelectedVideo(defaultVideo.deviceId)
      if (defaultAudio) setSelectedAudio(defaultAudio.deviceId)
    } catch (error) {
      console.error('Error getting devices:', error)
    }
  }

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined,
          aspectRatio: 9/16,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: selectedAudio ? { deviceId: selectedAudio } : true
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error: any) {
      toast.error('Failed to access camera')
      console.error('Camera error:', error)
    }
  }

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await initializeCamera()
      }

      // Start countdown
      setCountdown(3)
      for (let i = 2; i >= 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCountdown(i)
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current!)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      setIsRecording(true)
      onRecordingChange?.(true)
      setCountdown(null)
      
      mediaRecorder.start(1000)
    } catch (error: any) {
      setIsRecording(false)
      onRecordingChange?.(false)
      setCountdown(null)
      toast.error('Failed to start recording')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return
    setIsProcessing(true)
    onRecordingChange?.(false)

    try {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks()
        tracks?.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }

      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'recording.webm', { type: 'video/webm' })

      const response = await fetch('/api/videos/upload', {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get upload URL')
      }
      
      const { uploadUrl, assetId } = await response.json()
      if (!uploadUrl || !assetId) throw new Error('Failed to get upload URL')

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file
      })

      let asset = null
      for (let i = 0; i < 30; i++) {
        const assetResponse = await fetch(`/api/videos/${assetId}`)
        if (assetResponse.ok) {
          asset = await assetResponse.json()
          if (asset.status === 'ready' && asset.playback_id) break
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (!asset || asset.status !== 'ready') {
        throw new Error('Video processing timeout')
      }

      const videoData = {
        assetId: asset.id,
        playbackId: asset.playback_id,
        thumbnailUrl: asset.thumbnail_url,
        duration: asset.duration,
        status: asset.status
      }

      setRecordedVideo({
        playbackId: asset.playback_id,
        thumbnailUrl: asset.thumbnail_url
      })
      
      onSuccess(videoData)
      setIsRecording(false)
      setIsProcessing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop recording')
      console.error('Recording error:', error)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {isProcessing ? (
        <VideoProcessingSkeleton />
      ) : recordedVideo ? (
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[280px]">
              <MuxVideoPlayer playbackId={recordedVideo.playbackId} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[280px] relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-gray-200 rounded-lg"
                />
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-8xl font-bold text-white">{countdown || "GO!"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <Button 
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              variant="secondary"
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Camera</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedVideo} onValueChange={setSelectedVideo}>
                  {videoDevices.map(device => (
                    <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Microphone</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedAudio} onValueChange={setSelectedAudio}>
                  {audioDevices.map(device => (
                    <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  )
}