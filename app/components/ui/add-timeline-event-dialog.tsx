"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { VideoUpload } from "../ui/video-upload"
import { Video } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ErrorBoundary } from "@/components/error-boundary"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { MuxVideoPlayer } from "../ui/mux-video-player"

interface VideoData {
  assetId: string
  playbackId: string
  thumbnailUrl: string
  duration: number | null
  status: string | null
}

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  video: z.object({
    assetId: z.string(),
    playbackId: z.string(),
    thumbnailUrl: z.string(),
    duration: z.number().nullish(),
    status: z.string().nullish()
  }).required()
})

type EventFormValues = z.infer<typeof eventFormSchema>

function FormFieldsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" /> {/* Title label */}
        <Skeleton className="h-10 w-full rounded-md" /> {/* Title input */}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" /> {/* Date label */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-full rounded-md" /> {/* Month select */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Year select */}
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-md" /> {/* Submit button */}
    </div>
  )
}

function AddTimelineEventDialogContent({ businessId }: { businessId: string }) {
  const [step, setStep] = useState<'RECORD' | 'DETAILS'>('RECORD')
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split('T')[0],
    }
  })

  const resetStates = () => {
    setOpen(false)
    setStep('RECORD')
    setVideoData(null)
    form.reset()
  }

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('business_timeline_events')
        .insert([{
          business_id: businessId,
          title: data.title,
          date: new Date(data.date).toISOString(),
          created_by: user.id,
          video_asset_id: data.video?.assetId,
          video_playback_id: data.video?.playbackId,
          thumbnail_url: data.video?.thumbnailUrl,
          video_duration: data.video?.duration ? Math.round(data.video.duration) : null,
          video_status: data.video?.status || 'ready'
        }])

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event added successfully")
      resetStates()
      queryClient.invalidateQueries({ queryKey: ['business-timeline', businessId] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add event")
    }
  })

  const handleVideoUpload = (data: VideoData) => {
    setVideoData(data)
    form.setValue('video', data)
    setStep('DETAILS')
  }

  useEffect(() => {
    return () => {
      setOpen(false)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={resetStates}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
        </DialogHeader>
        
        {step === 'RECORD' && (
          <VideoUpload 
            onSuccess={handleVideoUpload}
          />
        )}

        {step === 'DETAILS' && videoData && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => {
              createEventMutation.mutate(data)
            })} className="space-y-4">
              <div className="w-full max-w-[280px] mx-auto">
                <MuxVideoPlayer 
                  playbackId={videoData.playbackId}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <div className="flex gap-2">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          value={field.value ? new Date(field.value).getMonth() : new Date().getMonth()}
                          onChange={(e) => {
                            const currentDate = field.value ? new Date(field.value) : new Date();
                            currentDate.setMonth(parseInt(e.target.value));
                            field.onChange(currentDate.toISOString());
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          value={field.value ? new Date(field.value).getFullYear() : new Date().getFullYear()}
                          onChange={(e) => {
                            const currentDate = field.value ? new Date(field.value) : new Date();
                            currentDate.setFullYear(parseInt(e.target.value));
                            field.onChange(currentDate.toISOString());
                          }}
                        >
                          {Array.from(
                            { length: new Date().getFullYear() - 1899 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('RECORD')}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Create Event
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AddTimelineEventDialog(props: { businessId: string }) {
  return (
    <ErrorBoundary>
      <AddTimelineEventDialogContent businessId={props.businessId} />
    </ErrorBoundary>
  )
} 