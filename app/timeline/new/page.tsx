"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { VideoUpload } from "../../components/ui/video-upload"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  video: z.object({
    assetId: z.string(),
    playbackId: z.string(),
    thumbnailUrl: z.string(),
    duration: z.number().optional(),
    status: z.string().optional()
  }).required()
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function NewTimelineEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('businessId')
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  const [showFields, setShowFields] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split('T')[0],
    }
  })

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      if (!businessId) throw new Error("Business ID is required")

      const { data: newEvent, error } = await supabase
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
        .select()
        .single()

      if (error) throw error
      return newEvent
    },
    onSuccess: (data) => {
      toast.success("Event added successfully")
      router.push(`/businesses/${businessId}/profile?scrollToEvent=${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add event")
    }
  })

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording)
    if (!recording) {
      setIsVideoProcessing(true)
      setHasRecorded(true)
      setShowFields(true)
    }
  }

  const handleVideoUpload = (videoData: {
    assetId: string,
    playbackId: string,
    thumbnailUrl: string,
    duration: number | null,
    status: string | null
  }) => {
    setIsVideoProcessing(false)
    form.setValue('video', {
      ...videoData,
      duration: videoData.duration || 0,
      status: videoData.status || 'ready'
    })
  }

  if (!businessId) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">Missing business ID parameter</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Add Timeline Event</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="w-full max-w-[540px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-8">
              <VideoUpload 
                onSuccess={handleVideoUpload}
                onRecordingChange={(recording, fromStartOver) => {
                  handleRecordingChange(recording)
                  if (fromStartOver) {
                    setShowFields(false)
                  }
                }}
                onProcessingStart={() => setShowFields(true)}
              />
              
              {showFields && (
                <div className="space-y-4 mt-4">
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
              )}
              
              {showFields && (
                <div>
                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
} 