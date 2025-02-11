"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string(),
  emoji: z.string().nullable(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EditTimelineEvent({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [event, setEvent] = useState<EventFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split('T')[0],
      emoji: null,
    }
  })

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data: event } = await supabase
          .from('business_timeline_events')
          .select('*')
          .eq('id', params.id)
          .single()

        if (event) {
          const formattedEvent = {
            title: event.title,
            date: new Date(event.date).toISOString().split('T')[0],
            emoji: event.emoji,
          }
          setEvent(formattedEvent)
          form.reset(formattedEvent)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to load event')
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [params.id, form])

  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { error } = await supabase
        .from('business_timeline_events')
        .update({
          title: values.title,
          date: values.date,
          emoji: values.emoji,
        })
        .eq('id', params.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event updated successfully")
      router.back()
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event")
    }
  })

  function onSubmit(values: EventFormValues) {
    updateEventMutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Event not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Timeline Event</h1>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emoji (optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="h-10 px-3 rounded-md border border-input flex items-center min-w-[4rem] bg-background">
                      {field.value || "No emoji"}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="h-10 w-10"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="p-0 w-[352px] border-none" 
                        side="right" 
                        align="start"
                        sideOffset={5}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={(data: any) => {
                            console.log('Selected:', data);
                            field.onChange(data.native);
                          }}
                          theme="light"
                          set="native"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
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

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 