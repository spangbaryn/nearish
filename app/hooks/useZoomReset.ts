import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useZoomReset() {
  const pathname = usePathname()

  useEffect(() => {
    // Force viewport reset
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
    }
    
    // Force zoom reset
    document.documentElement.style.zoom = '100%'
    
    // For iOS Safari
    document.documentElement.style.webkitTextSizeAdjust = '100%'
  }, [pathname])
} 