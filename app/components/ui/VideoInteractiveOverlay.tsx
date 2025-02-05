"use client"

import { useRef, useEffect } from "react"
import { Play, Pause, Volume, VolumeX, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const progressKeyframes = `
  .progress-animation {
    animation-duration: var(--duration);
    animation-timing-function: linear;
    animation-name: progress;
    animation-play-state: var(--play-state);
  }

  @keyframes progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
`

export interface VideoInteractiveOverlayProps {
  className?: string
  isMuted: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  captions?: string
  header?: string
  subheader?: string
  posterInfo?: {
    username: string
    avatarUrl?: string
  }
  onToggleMute: () => void
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onShare: () => void
  isHorizontal?: boolean
}

export function VideoInteractiveOverlay({
  className,
  isMuted,
  isPaused,
  currentTime,
  duration,
  captions,
  header,
  subheader,
  posterInfo,
  onToggleMute,
  onTogglePlay,
  onPrev,
  onNext,
  onShare,
  isHorizontal = false
}: VideoInteractiveOverlayProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const progressBar = progressRef.current;
    if (progressBar && !isPaused && duration > 0) {
      const remainingTime = Math.max(0, duration - currentTime) * 1000;
      if (remainingTime <= 0) return;

      const animation = progressBar.animate([
        { transform: `translate3d(${(currentTime / duration) * 100}%, 0, 0)` },
        { transform: 'translate3d(100%, 0, 0)' }
      ], {
        duration: remainingTime,
        easing: 'linear'
      });

      return () => animation.cancel();
    }
  }, [currentTime, duration, isPaused]);

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPrev?.()
  }

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNext?.()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  return (
    <>
    <style>{progressKeyframes}</style>
    <div 
      className={cn("z-30 overflow-hidden touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Duration Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="relative w-full h-1 mt-2 px-4">
          <div className="relative w-full h-full bg-gray-600 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="absolute inset-y-0 left-0 bg-white will-change-transform rounded-full"
              style={{ 
                width: '100%',
                transform: `translate3d(${((currentTime / duration) * 100) - 100}%, 0, 0)`
              }} 
            />
          </div>
        </div>
      </div>

      {/* Top Section: Audio Button */}
      <div className="absolute top-4 left-0 right-0 flex items-start p-4 z-[60] pointer-events-auto">
        <div className="flex-1" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleMute} 
          className="h-12 w-12 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto"
        >
          {isMuted ? (
            <VolumeX className="h-8 w-8 text-white" />
          ) : (
            <Volume className="h-8 w-8 text-white" />
          )}
        </Button>
      </div>

      {/* Center Section: Tap to Play/Pause */}
      <div onClick={onTogglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-auto z-40">
        {isPaused && (
          <Play className="w-12 h-12 text-white opacity-80" />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-auto z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto"
          onClick={handlePrevClick}
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pointer-events-auto z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto"
          onClick={handleNextClick}
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-auto flex flex-col space-y-2">
        {(header || subheader) && (
          <div className="w-full flex justify-center">
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 max-w-[80%] min-w-[250px]">
              <div className="flex flex-col items-center text-center">
                {header && (
                  <h3 className="text-3xl font-bold text-white tracking-tight">
                    {header}
                  </h3>
                )}
                {subheader && (
                  <p className="text-lg text-white/80 mt-1">
                    {subheader}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={onShare}>
            <Share2 className="w-5 h-5 text-white" />
          </Button>
        </div>
        {captions && (
          <div className="bg-black bg-opacity-50 p-2 rounded-md">
            <p className="text-white text-sm">{captions}</p>
          </div>
        )}
      </div>

      {/* Optional Horizontal Video Blurring */}
      {isHorizontal && (
        <>
          <div className="absolute top-0 left-0 right-0 h-16 bg-black bg-opacity-50 backdrop-blur-md" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black bg-opacity-50 backdrop-blur-md" />
        </>
      )}
    </div>
    </>
  )
} 