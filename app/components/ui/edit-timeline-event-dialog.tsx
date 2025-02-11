"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cn } from "@/lib/utils"

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string(),
  emoji: z.string().nullable(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EditTimelineEventDialogProps {
  event: {
    id: string
    title: string
    date: string
    emoji?: string | null
  }
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTimelineEventDialog({ event, className, open, onOpenChange }: EditTimelineEventDialogProps) {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      emoji: event.emoji || null,
    }
  })

  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { error } = await supabase
        .from('business_timeline_events')
        .update({
          title: values.title,
          date: values.date,
          emoji: values.emoji,
        })
        .eq('id', event.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event updated successfully")
      queryClient.invalidateQueries({ queryKey: ['business-timeline'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event")
    }
  })

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('business_timeline_events')
        .delete()
        .eq('id', event.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Event deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['business-timeline'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete event")
    }
  })

  function onSubmit(values: EventFormValues) {
    updateEventMutation.mutate(values)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => onOpenChange(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this event?")) {
                deleteEventMutation.mutate()
              }
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Edit Timeline Event</DialogTitle>
            <DialogDescription>
              Make changes to your timeline event here.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Add an emoji (e.g. 🎉)" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
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
              <div className="flex justify-end">
                <Button type="submit" disabled={updateEventMutation.isPending}>
                  {updateEventMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
} 