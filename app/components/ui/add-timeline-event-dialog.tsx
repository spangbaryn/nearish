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

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  video: z.object({
    assetId: z.string(),
    playbackId: z.string(),
    thumbnailUrl: z.string(),
    duration: z.number().optional(),
    status: z.string().optional()
  }).optional()
})

type EventFormValues = z.infer<typeof eventFormSchema>

function AddTimelineEventDialogContent({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const queryClient = useQueryClient()

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
      setOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['business-timeline', businessId] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add event")
    }
  })

  const handleVideoUpload = (videoData: { 
    assetId: string, 
    playbackId: string, 
    thumbnailUrl: string,
    duration: number,
    status: string
  }) => {
    form.setValue('video', videoData)
  }

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording)
  }

  useEffect(() => {
    return () => {
      // Cleanup function to ensure state is reset
      setOpen(false)
      setIsRecording(false)
    }
  }, [])

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Only close if not recording
          if (!isRecording) {
            setOpen(false)
          }
        } else {
          setOpen(true)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Add a new event to your business timeline.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-4">
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
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Video (optional)</Label>
              <VideoUpload 
                onSuccess={handleVideoUpload} 
                onRecordingChange={handleRecordingChange}
              />
              {form.watch('video') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4" />
                  <span>Video uploaded successfully</span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={createEventMutation.isPending}>
              Add Event
            </Button>
          </form>
        </Form>
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