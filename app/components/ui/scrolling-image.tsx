"use client"

import { useEffect, useRef } from 'react'

interface ScrollingImageProps {
  imageUrl: string;
  speed?: number;
}

export function ScrollingImage({ imageUrl, speed = 20 }: ScrollingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let animationFrameId: number
    let position = 0
    const container = containerRef.current
    const image = imageRef.current

    if (!container || !image) return

    // Wait for image to load to get its width
    image.onload = () => {
      // Set container width to match the full width needed for both images
      container.style.width = `${image.naturalWidth * 2}px`
      
      const animate = () => {
        position -= speed / 60
        
        if (position <= -image.naturalWidth) {
          position = 0
        }

        container.style.transform = `translateX(${position}px)`
        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [speed])

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