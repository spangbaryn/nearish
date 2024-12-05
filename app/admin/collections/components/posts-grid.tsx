"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/database.types"

type Post = Database["public"]["Tables"]["posts"]["Row"]

interface PostsGridProps {
  collectionId: string
}

export function PostsGrid({ collectionId }: PostsGridProps) {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", collectionId],
    queryFn: async () => {
      const { data: postsInCollection, error: junctionError } = await supabase
        .from("posts_collections")
        .select("post_id")
        .eq("collection_id", collectionId)

      if (junctionError) {
        console.error('Junction table error:', junctionError)
        throw junctionError
      }

      if (!postsInCollection?.length) return []

      const postIds = postsInCollection.map(pc => pc.post_id)
      
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false })

      if (postsError) {
        console.error('Posts query error:', postsError)
        throw postsError
      }

      return posts
    }
  })

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
        <Link key={post.id} href={`/admin/posts/${post.id}?collection=${collectionId}`}>
          <Card className="hover:bg-muted/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {post.type || 'Post'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {post.content}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {post.source}
                </span>
                {post.ai_generated_type && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {post.ai_generated_type}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 