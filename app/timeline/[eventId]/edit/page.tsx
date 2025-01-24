"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"
import { use } from "react"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EditTimelineEventPage({ 
  params 
}: { 
  params: Promise<{ eventId: string }> 
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const resolvedParams = use(params)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString(),
    }
  })

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('business_timeline_events')
        .select('*')
        .eq('id', resolvedParams.eventId)
        .single()

      if (error) {
        toast.error("Failed to fetch event")
        return
      }

      if (data) {
        form.reset({
          title: data.title,
          date: new Date(data.date).toISOString(),
        })
      }
    }

    fetchEvent()
  }, [resolvedParams.eventId])

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const { error } = await supabase
        .from('business_timeline_events')
        .update({
          title: data.title,
          date: new Date(data.date).toISOString(),
        })
        .eq('id', resolvedParams.eventId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event updated successfully")
      router.back()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event")
    }
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Edit Timeline Event</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="w-full max-w-[540px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateEventMutation.mutate(data))} className="space-y-8">
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
              <Button type="submit" className="w-full">
                Update Event
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
} 