"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Database } from "@/types/database.types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"

type Post = Database["public"]["Tables"]["posts"]["Row"]

type Business = {
  id: string;
  name: string;
}

type BusinessMember = {
  business: {
    id: string;
    name: string;
  }
}

const postSchema = z.object({
  business_id: z.string().uuid("Invalid business ID"),
  content: z.string().min(1, "Content is required"),
  final_content: z.string().optional(),
  final_type: z.enum(['Promotion', 'Event', 'Update']).optional(),
  included: z.boolean().optional(),
  source: z.enum(["facebook", "admin", "platform"], {
    required_error: "Please select a source",
  }),
})

type PostForm = z.infer<typeof postSchema>

interface PostFormProps {
  post?: Post
  onSubmit: (data: PostForm) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function PostForm({ 
  post, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = "Submit" 
}: PostFormProps) {
  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      business_id: post?.business_id || "",
      content: post?.content || "",
      final_content: post?.final_content || "",
      final_type: post?.final_type || undefined,
      included: post?.included ?? true,
      source: post?.source || "admin",
    },
  })

  const { data: businesses, isLoading: loadingBusinesses, error } = useQuery<Business[]>({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      try {
        // Get current user and verify admin status
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) throw new Error('Not authenticated')

        // Get user's profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError) throw profileError
        if (profile.role !== 'admin') throw new Error('Unauthorized: Admin access required')

        // Fetch all businesses
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id, name')
          .order('name')

        if (businessError) throw businessError
        if (!businessData) return []

        console.log('Fetched businesses:', businessData) // Debug log
        return businessData
      } catch (err) {
        console.error('Detailed error:', err) // Debug log
        throw err
      }
    }
  })

  if (error) {
    console.error('Query error:', error)
    return <div>Error loading businesses: {error.message}</div>
  }

  if (loadingBusinesses) {
    return <LoadingSpinner />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="business_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businesses?.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="final_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Content</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="final_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Promotion">Promotion</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="included"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Include in Campaign</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {post?.ai_generated_type && (
          <FormItem>
            <FormLabel>AI Generated Type</FormLabel>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {post.ai_generated_type}
            </div>
          </FormItem>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
} 