"use client"

import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ScrollingImageProps {
  imageUrl: string;
  speed?: number;
}

export function ScrollingImage({ imageUrl, speed = 40 }: ScrollingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const isMobile = useIsMobile()
  
  // Adjust speed based on device type
  const adjustedSpeed = isMobile ? speed * 1.2 : speed

  useEffect(() => {
    let animationFrameId: number
    let position = 0
    const container = containerRef.current
    const image = imageRef.current

    if (!container || !image) return

    const setupAnimation = () => {
      const width = image.naturalWidth || image.width
      if (!width) return false

      container.style.width = `${width * 2}px`
      
      const animate = () => {
        position -= adjustedSpeed / 60
        
        if (position <= -width) {
          position = 0
        }

        container.style.transform = `translateX(${position}px)`
        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
      return true
    }

    if (image.complete && image.naturalWidth) {
      setupAnimation()
    } else {
      image.onload = () => {
        setTimeout(setupAnimation, 100)
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [adjustedSpeed])

  return (
    <div className="overflow-hidden" style={{ height: 176 }}>
      <div className="flex" ref={containerRef}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Scrolling content"
          style={{ height: 176, width: 4637 }}
        />
        <img
          src={imageUrl}
          alt="Scrolling content"
          style={{ height: 176, width: 4637 }}
        />
      </div>
    </div>
  )
}