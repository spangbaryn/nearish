"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function EmptyTimelineCard({ businessId, readOnly = false }: { businessId: string, readOnly?: boolean }) {
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
                className={cn(
                  "timeline-card min-w-[200px] relative group bg-white z-10 border-2",
                  !readOnly && "cursor-pointer hover:shadow-lg hover:border-primary/20"
                )}
                onClick={() => !readOnly && router.push(`/timeline/new?businessId=${businessId}`)}
              >
                <CardContent className="p-4 pb-10 relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-t-lg" />
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    {!readOnly ? (
                      <>
                        <div className="rounded-full bg-muted/30 p-3">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-center">Add your first event</h3>
                      </>
                    ) : (
                      <h3 className="text-lg font-semibold text-center text-muted-foreground">No events yet</h3>
                    )}
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