import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { toast } from "sonner"

interface ThumbnailCaptureProps {
  onCapture: (thumbnailUrl: string) => void
}

export function ThumbnailCapture({ onCapture }: ThumbnailCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Using same camera initialization as VideoRecorder
  const initializeCamera = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      const constraints = {
        video: {
          ...(isMobile ? {
            facingMode: 'user',
            aspectRatio: 1
          } : {
            width: { ideal: 720 },
            height: { ideal: 720 },
            aspectRatio: { exact: 1 }
          }),
        },
        audio: false
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

  useEffect(() => {
    initializeCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (!context) return

      // Capture the current frame
      context.drawImage(videoRef.current, 0, 0, 720, 720)
      
      // Convert to base64
      const thumbnailUrl = canvasRef.current.toDataURL('image/jpeg', 0.8)
      onCapture(thumbnailUrl)

      // Stop camera after capture
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas 
          ref={canvasRef} 
          width={720} 
          height={720} 
          className="hidden" 
        />
      </div>

      <Button onClick={capturePhoto}>
        <Camera className="w-4 h-4 mr-2" />
        Capture Photo
      </Button>
    </div>
  )
} 