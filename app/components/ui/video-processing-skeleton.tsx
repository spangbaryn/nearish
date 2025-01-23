"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function VideoProcessingSkeleton() {
  return (
    <div className="aspect-[9/16] w-full">
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  )
} 