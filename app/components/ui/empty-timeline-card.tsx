"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function EmptyTimelineCard({ businessId }: { businessId: string }) {
  const router = useRouter()

  return (
    <div className="w-full">
      <div className="relative">
        <div className="timeline-connector" />
        <div className="flex gap-4 py-16 px-8">
          <div className="relative">
            <div className="timeline-year">
              {new Date().getFullYear()}
            </div>
            <div className="timeline-card-container offset-up">
              <Card 
                className="timeline-card min-w-[200px] cursor-pointer transition-colors relative group hover:shadow-lg bg-white z-10 border-2 hover:border-primary/20"
                onClick={() => router.push(`/timeline/new?businessId=${businessId}`)}
              >
                <CardContent className="p-4 pb-10 relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg" />
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="rounded-full bg-muted/30 p-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-center">Add your first event</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}