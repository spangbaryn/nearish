"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostForm } from "../components/post-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreatePostPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const collectionId = searchParams.get('collection')

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      // First create the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([data])
        .select()
        .single()

      if (postError) throw postError

      // If we have a collection ID, add the post to the collection
      if (collectionId) {
        const { error: collectionError } = await supabase
          .from('posts_collections')
          .insert([{
            post_id: post.id,
            collection_id: collectionId
          }])

        if (collectionError) throw collectionError
      }

      return post
    },
    onSuccess: () => {
      toast.success("Post created successfully")
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      router.push(collectionId ? `/admin/collections/${collectionId}` : '/admin/posts')
    },
    onError: (error: any) => {
      toast.error("Failed to create post", {
        description: error.message
      })
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={collectionId ? `/admin/collections/${collectionId}` : '/admin/posts'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm
              onSubmit={createPost.mutate}
              isSubmitting={createPost.isPending}
              submitLabel="Create Post"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 