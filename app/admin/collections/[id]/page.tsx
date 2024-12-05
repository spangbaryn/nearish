"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { RequireAdmin } from "../../components/require-admin"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { PostsGrid } from "../components/posts-grid"

export default function CollectionDetailPage() {
  const params = useParams()
  const collectionId = params.id as string

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single()

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <RequireAdmin>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/collections">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{collection?.name}</h1>
            </div>

            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {collection?.description}
              </p>
              <Link href={`/admin/posts/create?collection=${collectionId}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <PostsGrid collectionId={collectionId} />
            </div>
          </div>
        </div>
      </RequireAdmin>
    </AuthenticatedLayout>
  )
} 