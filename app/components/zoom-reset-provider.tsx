"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ZoomResetProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const resetZoom = () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
      }
    }

    // Reset on route changes
    resetZoom()

    // Reset when modals close (only observe direct children of body)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          resetZoom()
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: false
    })

    return () => observer.disconnect()
  }, [pathname])

  return <>{children}</>
} 