"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ZoomResetProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const resetZoom = () => {
      // Force viewport reset
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        // Remove and re-add the viewport meta to force a reset
        viewport.remove()
        const newViewport = document.createElement('meta')
        newViewport.name = 'viewport'
        newViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0'
        document.head.appendChild(newViewport)
      }

      // Reset zoom using multiple approaches
      document.documentElement.style.zoom = '100%'
      document.body.style.zoom = '100%'
      document.documentElement.style.transform = 'scale(1)'
      document.body.style.transform = 'scale(1)'
      document.documentElement.style.webkitTextSizeAdjust = '100%'
      
      // Force layout recalculation
      window.scrollTo(0, 0)
      document.documentElement.style.display = 'none'
      document.documentElement.offsetHeight
      document.documentElement.style.display = ''
    }

    // Reset on route changes
    resetZoom()

    // Reset on any scroll event
    const handleScroll = () => resetZoom()
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Reset when modals close or DOM changes
    const observer = new MutationObserver(() => resetZoom())
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [pathname])

  return <>{children}</>
} 