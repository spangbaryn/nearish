"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function VideoProcessingSkeleton() {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-[280px] min-h-0 flex-1">
          <div className="aspect-w-9 aspect-h-16">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
} 