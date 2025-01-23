"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MuxVideoPlayer } from "@/components/ui/mux-video-player"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { use } from "react"

interface TimelinePageProps {
  params: Promise<{
    eventId: string
  }>
  searchParams: Promise<{
    events: string
  }>
}

export default function TimelinePage({ params, searchParams }: TimelinePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  
  const events = JSON.parse(decodeURIComponent(resolvedSearchParams.events))
  const currentIndex = events.findIndex(e => e.id === resolvedParams.eventId)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleVideoEnded = () => {
    setIsVideoEnded(true)
    setIsTransitioning(true)
    const nextIndex = (currentIndex + 1) % events.length
    navigateToEvent(events[nextIndex].id)
  }

  const handleBackgroundClick = () => {
    router.back()
  }

  const navigateToEvent = (eventId: string) => {
    router.push(`/timeline/${eventId}?events=${resolvedSearchParams.events}`)
  }

  useEffect(() => {
    setIsVideoEnded(false)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [resolvedParams.eventId])

  return (
    <div className="fixed inset-0 bg-background/95 z-50" onClick={handleBackgroundClick}>
      {/* Rest of the UI remains the same as TimelineEventOverlay */}
    </div>
  )
} 