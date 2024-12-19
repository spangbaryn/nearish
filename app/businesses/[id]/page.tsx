"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { SendHorizontal } from "lucide-react"

interface BusinessDashboardData {
  id: string
  name: string
}

export default function BusinessDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BusinessDashboardData
    }
  })

  const createPost = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            business_id: id,
            content,
            source: 'platform',
            included: true
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Post created successfully')
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['business-posts', id] })
    },
    onError: (error) => {
      toast.error('Failed to create post: ' + error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }
    setIsSubmitting(true)
    try {
      await createPost.mutateAsync()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-destructive">Business not found</h1>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="min-w-0 flex-1 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{business.name}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !content.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <SendHorizontal className="mr-2 h-4 w-4" />
                )}
                Post
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 