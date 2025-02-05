"use client"

import { useRouter } from "next/navigation"
import { use } from "react"
import { VideoViewingOverlay, type VideoItem } from "@/app/components/ui/video-viewing-overlay"

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
  const items: VideoItem[] = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    subtitle: event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : undefined,
    description: event.description,
    video_playback_id: event.media_url || "",
    media_url: event.media_url
  }))

  return (
    <VideoViewingOverlay
      items={items}
      currentId={resolvedParams.eventId}
      onClose={() => router.back()}
      onItemChange={(id) => {
        router.push(`/timeline/${id}?events=${resolvedSearchParams.events}`)
      }}
    />
  )
} 