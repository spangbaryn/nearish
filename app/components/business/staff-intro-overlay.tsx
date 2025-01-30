import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MuxVideoPlayer } from "../ui/mux-video-player"
import Image from "next/image"
import { useEffect } from "react"

interface StaffIntroOverlayProps {
  intro: {
    first_name: string
    role: string
    favorite_spot: string | null
    video_playback_id: string
  }
  onClose: () => void
  color?: string
}

export function StaffIntroOverlay({ intro, onClose, color = "#000000" }: StaffIntroOverlayProps) {
  useEffect(() => {
    // Save the original margin
    const originalMargin = document.body.style.margin
    
    // Remove margin and prevent scroll
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Restore original styles
      document.body.style.margin = originalMargin
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-background z-[9999] flex flex-col m-0"
      aria-modal="true"
      role="dialog"
      style={{ 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        margin: 0
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-background/50 backdrop-blur-sm">
        <Image
          src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
          alt="Nearish Logo"
          width={240}
          height={70}
          className="h-20 w-auto"
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Video Player */}
        <div className="w-full h-full flex flex-col justify-center px-4 py-8">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <MuxVideoPlayer 
              playbackId={intro.video_playback_id}
              autoPlay={true}
              color={color}
            />
          </div>
          
          {/* Info Card - Matching Timeline Event Style */}
          <div className="max-w-2xl mx-auto w-full mt-8 px-4">
            <div className="bg-background/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold">{intro.first_name}</h3>
                <span className="text-sm text-muted-foreground/80">
                  {intro.role}
                </span>
              </div>
              {intro.favorite_spot && (
                <p className="mt-3 text-muted-foreground/90 leading-relaxed">
                  Favorite Local Spot: {intro.favorite_spot}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 