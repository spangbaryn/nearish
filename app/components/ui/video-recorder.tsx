"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Video, StopCircle, Settings } from "lucide-react"
import { MuxVideoPlayer } from "./mux-video-player"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoData {
  assetId: string
  playbackId: string
  thumbnailUrl: string
  duration: number | null
  status: string | null
}

interface VideoRecorderProps {
  onSuccess: (data: VideoData) => void
  onRecordingChange?: (isRecording: boolean, fromStartOver?: boolean) => void
  onCountdownChange?: (countdown: number | null) => void
  onInitialized?: () => void
}

interface MediaDevice {
  deviceId: string
  label: string
}

export function VideoRecorder({ onSuccess, onRecordingChange, onCountdownChange, onInitialized }: VideoRecorderProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastUsedCamera') || ''
    }
    return ''
  })
  const [selectedAudio, setSelectedAudio] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastUsedMicrophone') || ''
    }
    return ''
  })
  const [isInitializing, setIsInitializing] = useState(true)
  const initStartTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const initialize = async () => {
      try {
        await getMediaDevices()
        await initializeCamera()
        onInitialized?.()
      } catch (error) {
        console.error('Failed to initialize devices:', error)
        onInitialized?.()
      }
    }

    initialize()

    return () => {
      stopAllTracks()
    }
  }, [])

  useEffect(() => {
    if (selectedVideo || selectedAudio) {
      if (!isRecording) {
        initializeCamera()
      }
    }
  }, [selectedVideo, selectedAudio])

  useEffect(() => {
    onCountdownChange?.(countdown)
  }, [countdown, onCountdownChange])

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
      
      // Check if stored devices are still available
      const lastCamera = localStorage.getItem('lastUsedCamera')
      const lastMic = localStorage.getItem('lastUsedMicrophone')
      
      if (lastCamera && videoInputs.some(d => d.deviceId === lastCamera)) {
        setSelectedVideo(lastCamera)
      } else if (videoInputs.length > 0) {
        setSelectedVideo(videoInputs[0].deviceId)
      }
      
      if (lastMic && audioInputs.some(d => d.deviceId === lastMic)) {
        setSelectedAudio(lastMic)
      } else if (audioInputs.length > 0) {
        setSelectedAudio(audioInputs[0].deviceId)
      }
    } catch (error) {
      console.error('Error getting devices:', error)
      toast.error('Failed to access media devices')
    }
  }

  const initializeCamera = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      const constraints = {
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined,
          ...(isMobile ? {
            facingMode: 'user',
            aspectRatio: 0.5625
          } : {
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            aspectRatio: { exact: 0.5625 }
          }),
        },
        audio: selectedAudio ? { deviceId: selectedAudio } : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
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
    try {
      setIsRecording(false)
      setIsProcessing(true)
      onRecordingChange?.(false)

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }

      stopAllTracks()

      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'recording.webm', { type: 'video/webm' })

      const response = await fetch('/api/videos/upload', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL')
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
          if (asset.status === 'ready' && asset.playback_id) {
            const videoData = {
              assetId: asset.id,
              playbackId: asset.playback_id,
              thumbnailUrl: asset.thumbnail_url,
              duration: asset.duration || null,
              status: asset.status || null
            }
            setIsProcessing(false)
            onSuccess(videoData)
            return
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      throw new Error('Video processing timeout')
    } catch (error: any) {
      setIsProcessing(false)
      toast.error(error.message || 'Failed to stop recording')
      console.error('Recording error:', error)
      onRecordingChange?.(false, true)
    }
  }

  const stopAllTracks = () => {
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

  const handleVideoChange = (deviceId: string) => {
    setSelectedVideo(deviceId)
    localStorage.setItem('lastUsedCamera', deviceId)
  }

  const handleAudioChange = (deviceId: string) => {
    setSelectedAudio(deviceId)
    localStorage.setItem('lastUsedMicrophone', deviceId)
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1">
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-[280px] min-h-0 flex-1">
            <div className="aspect-[9/16] relative overflow-hidden rounded-lg bg-gray-200 h-full max-h-[70vh]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 min-h-full min-w-full"
                style={{
                  transform: 'scaleX(-1)',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-8xl font-bold text-white">{countdown || "GO!"}</span>
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-xl font-bold text-white">Processing video...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-[540px] relative">
          {!countdown && !isProcessing && (
            <>
              <div className="absolute right-4 -top-14">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Camera</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedVideo} onValueChange={handleVideoChange}>
                      {videoDevices.map(device => (
                        <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Microphone</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedAudio} onValueChange={handleAudioChange}>
                      {audioDevices.map(device => (
                        <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-center gap-4">
                <Button 
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "secondary"}
                  disabled={isProcessing}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}