"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { Database } from "@/types/database.types"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Post = Database["public"]["Tables"]["posts"]["Row"]

interface PostsGridProps {
  collectionId: string
}

export function PostsGrid({ collectionId }: PostsGridProps) {
  const queryClient = useQueryClient()
  const [finalContents, setFinalContents] = useState<Record<string, string>>({})
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({})

  const updateIncludedStatus = useMutation({
    mutationFn: async ({ postId, included }: { postId: string; included: boolean }) => {
      const { error } = await supabase
        .from("posts")
        .update({ included })
        .eq('id', postId)

      if (error) throw error
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', collectionId] })
      showSavedMessage(postId)
    },
    onError: (error: any) => {
      toast.error("Failed to update post status", {
        description: error.message
      })
    }
  })

  const updateFinalContent = useMutation({
    mutationFn: async ({ postId, finalContent }: { postId: string; finalContent: string }) => {
      const { error } = await supabase
        .from("posts")
        .update({ final_content: finalContent })
        .eq('id', postId)

      if (error) throw error
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', collectionId] })
      showSavedMessage(postId)
    },
    onError: (error: any) => {
      toast.error("Failed to update final content", {
        description: error.message
      })
    }
  })

  const updateFinalType = useMutation({
    mutationFn: async ({ postId, finalType }: { postId: string; finalType: 'Promotion' | 'Event' | 'Update' | null }) => {
      const { error } = await supabase
        .from("posts")
        .update({ final_type: finalType })
        .eq('id', postId)

      if (error) throw error
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', collectionId] })
      showSavedMessage(postId)
    },
    onError: (error: any) => {
      toast.error("Failed to update final type", {
        description: error.message
      })
    }
  })

  const handleCardClick = (e: React.MouseEvent, postId: string) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT' && 
        (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      window.location.href = `/admin/posts/${postId}?collection=${collectionId}`
    }
  }

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", collectionId],
    queryFn: async () => {
      const { data: postsInCollection, error: junctionError } = await supabase
        .from("posts_collections")
        .select("post_id")
        .eq("collection_id", collectionId)

      if (junctionError) throw junctionError
      if (!postsInCollection?.length) return []

      const postIds = postsInCollection.map(pc => pc.post_id)
      
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          businesses:business_id (
            id,
            name
          )
        `)
        .in("id", postIds)
        .order("created_at", { ascending: false })

      if (postsError) throw postsError

      // Initialize finalContents with current values
      const initialContents: Record<string, string> = {}
      posts?.forEach(post => {
        initialContents[post.id] = post.final_content || ''
      })
      setFinalContents(initialContents)

      return posts
    }
  })

  // Show saved message temporarily
  const showSavedMessage = (postId: string) => {
    setSavedStates(prev => ({ ...prev, [postId]: true }))
    setTimeout(() => {
      setSavedStates(prev => ({ ...prev, [postId]: false }))
    }, 2000)
  }

  if (error) {
    console.error('Query error:', error)
    return (
      <div className="p-4 text-red-500">
        Error loading posts. Please check the console for details.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts?.map((post) => (
        <div key={post.id} className="relative">
          {savedStates[post.id] && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium z-20">
              Saved
            </div>
          )}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="text-xs font-medium">Include</span>
            <Checkbox
              checked={post.included}
              onCheckedChange={(checked) => {
                updateIncludedStatus.mutate({
                  postId: post.id,
                  included: checked as boolean
                })
              }}
            />
          </div>

          <Card className="hover:bg-muted/50 cursor-pointer" onClick={(e) => handleCardClick(e, post.id)}>
            <CardHeader className="flex flex-col space-y-2">
              <CardTitle className="text-base font-medium">
                {post.businesses?.name || 'Unnamed Business'}
              </CardTitle>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Generated Type</span>
                  <span className="text-sm text-muted-foreground">
                    {post.ai_generated_type || 'Not classified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Final Type</span>
                  <Select
                    value={post.final_type || undefined}
                    onValueChange={(value) => {
                      updateFinalType.mutate({
                        postId: post.id,
                        finalType: value as 'Promotion' | 'Event' | 'Update' | null
                      })
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Promotion">Promotion</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Original Content</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {post.content}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Final Content</h4>
                <textarea
                  value={finalContents[post.id] || ''}
                  onChange={(e) => setFinalContents(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  onBlur={() => {
                    if (finalContents[post.id] !== post.final_content) {
                      updateFinalContent.mutate({
                        postId: post.id,
                        finalContent: finalContents[post.id]
                      })
                    }
                  }}
                  className="text-xs text-muted-foreground w-full p-2 rounded-md border border-input resize-none min-h-[60px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {post.source}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
} 