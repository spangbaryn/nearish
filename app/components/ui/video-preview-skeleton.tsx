"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function VideoPreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-w-9 aspect-h-16">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2">
            <Skeleton className="h-4 w-24 rounded-md" />
          </span>
        </div>
      </div>
    </div>
  )
} 