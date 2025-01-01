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

    const setupAnimation = () => {
      // Ensure we have a valid width
      const width = image.naturalWidth || image.width
      if (!width) return false

      // Set container width
      container.style.width = `${width * 2}px`
      
      const animate = () => {
        position -= speed / 60
        
        if (position <= -width) {
          position = 0
        }

        container.style.transform = `translateX(${position}px)`
        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
      return true
    }

    // Try to setup immediately if image is already loaded
    if (image.complete && image.naturalWidth) {
      setupAnimation()
    } else {
      // Wait for image to load
      image.onload = () => {
        // Add a small delay to ensure naturalWidth is available
        setTimeout(setupAnimation, 100)
      }
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