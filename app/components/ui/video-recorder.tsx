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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedAudio, setSelectedAudio] = useState<string>('')

  useEffect(() => {
    const initialize = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        const audioDevices = devices.filter(device => device.kind === 'audioinput')
        
        setVideoDevices(videoDevices)
        setAudioDevices(audioDevices)
        
        if (videoDevices.length > 0) {
          setSelectedVideo(videoDevices[0].deviceId)
        }
        if (audioDevices.length > 0) {
          setSelectedAudio(audioDevices[0].deviceId)
        }

        await initializeCamera()
        onInitialized?.()
      } catch (error) {
        console.error('Failed to initialize devices:', error)
        onInitialized?.() // Call even on error to prevent infinite loading
      }
    }

    initialize()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (selectedVideo || selectedAudio) {
      if (!isRecording) {
        initializeCamera()
      }
    }
  }, [selectedVideo, selectedAudio, isRecording])

  useEffect(() => {
    onCountdownChange?.(countdown)
  }, [countdown, onCountdownChange])

  useEffect(() => {
    initializeCamera()
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null
      }
    }
  }, [])

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
      const constraints = {
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 0.5625 } // 9:16 aspect ratio
        },
        audio: selectedAudio ? { deviceId: selectedAudio } : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      onInitialized?.()
    } catch (error: any) {
      toast.error('Failed to access camera')
      console.error('Camera error:', error)
      onInitialized?.()
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
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (streamRef.current) {
        // Turn off the camera and mic
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current?.srcObject) {
        // Stop all tracks for the video element
        const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks();
        tracks?.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
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
        duration: asset.duration || null,
        status: asset.status || null
      }

      onSuccess(videoData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop recording')
      console.error('Recording error:', error)
      onRecordingChange?.(false, true)
    }
  }

  const handleStartOver = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks()
      tracks?.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsRecording(false)
    chunksRef.current = []
    onRecordingChange?.(false, true)
    initializeCamera()
  }

  // Stop camera & mic and reset everything
  function stopAllTracks() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
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

  // Automatically release resources when component unmounts
  useEffect(() => {
    return () => {
      stopAllTracks()
    }
  }, [])

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
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-[540px] relative">
          {!countdown && (
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
              <div className="flex justify-center gap-4">
                <Button 
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "secondary"}
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
                {isRecording && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}