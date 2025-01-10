"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"

const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required" }),
    to: z.date({ required_error: "End date is required" })
  })
})

interface FacebookFetchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
}

export function FacebookFetchModal({ open, onOpenChange, collectionId }: FacebookFetchModalProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  })

  const fetchPosts = useMutation({
    mutationFn: async (dateRange: DateRange) => {
      if (!dateRange.from || !dateRange.to) {
        throw new Error('Please select a date range')
      }

      try {
        // Get all Facebook page connections
        const { data: connections, error: connectionsError } = await supabase
          .from('business_social_connections')
          .select(`
            id,
            business_id,
            external_id,
            social_credentials (
              token
            )
          `)
          .eq('platform', 'facebook')

        if (connectionsError) {
          console.error('Connections error:', connectionsError)
          throw new Error(`Failed to fetch connections: ${connectionsError.message}`)
        }

        if (!connections.length) {
          throw new Error('No Facebook pages connected')
        }

        const allPosts = []

        // Fetch posts for each connected page
        for (const connection of connections) {
          if (!connection.social_credentials?.[0]?.token) {
            console.warn(`No access token found for page ${connection.external_id}`)
            continue
          }

          // Fetch posts from Facebook
          const response = await fetch('/api/facebook/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageId: connection.external_id,
              accessToken: connection.social_credentials[0].token,
              dateRange: {
                from: dateRange.from,
                to: dateRange.to
              }
            })
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(`Facebook API error: ${error.message}`)
          }

          const responseData = await response.json()

          if (!Array.isArray(responseData)) {
            console.error('Unexpected response format:', responseData)
            throw new Error('Invalid response format from Facebook API')
          }

          allPosts.push(...responseData.map((post: any) => ({
            business_id: connection.business_id,
            source: 'facebook' as const,
            external_id: post.id,
            content: post.message || '',
            final_content: post.message || '',
            final_type: null,
            ai_generated_type: null,
            included: true,
            published_at: post.created_time,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            url: post.permalink_url
          })))
        }

        // Insert posts and create collection associations
        for (const post of allPosts) {
          try {
            const { data: insertedPost, error: insertError } = await supabase
              .from('posts')
              .upsert(post)
              .select()
              .single()

            if (insertError) {
              console.error('Post insert error:', insertError)
              throw new Error(`Failed to insert post: ${insertError.message}`)
            }

            const { error: relationError } = await supabase
              .from('posts_collections')
              .upsert({
                post_id: insertedPost.id,
                collection_id: collectionId
              })

            if (relationError) {
              console.error('Relation error:', relationError)
              throw new Error(`Failed to create post relation: ${relationError.message}`)
            }
          } catch (error) {
            console.error('Database operation error:', error)
            throw error
          }
        }

        return allPosts
      } catch (error: any) {
        console.error('Full error details:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', collectionId] })
      onOpenChange(false)
      toast.success('Posts imported successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to import posts', {
        description: error.message
      })
    }
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    fetchPosts.mutate(data.dateRange)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Facebook Posts</DialogTitle>
          <DialogDescription>
            Select a date range to import posts from your connected Facebook pages.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={fetchPosts.isPending}>
                {fetchPosts.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Importing...
                  </>
                ) : (
                  'Import Posts'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 