"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "../components/post-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function EditPostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const postId = params.id as string
  const collectionId = searchParams.get('collection')

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) throw error
      return data
    }
  })

  const updatePost = useMutation({
    mutationFn: async (data: any) => {
      const { error, data: updatedPost } = await supabase
        .from('posts')
        .update(data)
        .eq('id', postId)
        .select()
        .single()

      if (error) throw error
      return updatedPost
    },
    onSuccess: () => {
      toast.success("Post updated successfully")
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      if (collectionId) {
        router.push(`/admin/collections/${collectionId}`)
      } else {
        router.push('/admin/posts')
      }
    },
    onError: (error: any) => {
      toast.error("Failed to update post", {
        description: error.message
      })
    }
  })

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={collectionId ? `/admin/collections/${collectionId}` : '/admin/posts'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm
              post={post}
              onSubmit={updatePost.mutate}
              isSubmitting={updatePost.isPending}
              submitLabel="Update Post"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 