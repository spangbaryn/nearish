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
        .select(`
          *,
          businesses:business_id (
            id,
            name
          )
        `)
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
                  <span className="text-sm text-muted-foreground">
                    {post.final_type || 'Not set'}
                  </span>
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
              {post.final_content && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Final Content</h4>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {post.final_content}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {post.source}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.included 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {post.included ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 