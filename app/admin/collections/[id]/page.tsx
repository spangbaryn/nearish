"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Sparkles, Facebook } from "lucide-react"
import Link from "next/link"
import { PostsGrid } from "../components/posts-grid"
import { AIGenerationModal } from "../components/ai-generation-modal"
import { FacebookFetchModal } from "../components/facebook-fetch-modal"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function CollectionDetailPage() {
  const params = useParams()
  const collectionId = params.id as string
  const [showAIModal, setShowAIModal] = useState(false)
  const [description, setDescription] = useState("")
  const [savedState, setSavedState] = useState(false)
  const queryClient = useQueryClient()
  const [showFacebookModal, setShowFacebookModal] = useState(false)

  const updateDescription = useMutation({
    mutationFn: async (newDescription: string) => {
      const { error } = await supabase
        .from('collections')
        .update({ description: newDescription })
        .eq('id', collectionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] })
      setSavedState(true)
      setTimeout(() => setSavedState(false), 2000)
    },
    onError: (error: any) => {
      toast.error("Failed to update description", {
        description: error.message
      })
    }
  })

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single()

      if (error) throw error
      setDescription(data.description || '')
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

        <div className="flex justify-between items-start mb-6">
          <div className="relative flex-1 mr-4">
            {savedState && (
              <div className="absolute -top-6 left-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                Saved
              </div>
            )}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== collection?.description) {
                  updateDescription.mutate(description)
                }
              }}
              className="text-muted-foreground resize-none min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAIModal(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generation
            </Button>
            <Link href={`/admin/posts/create?collection=${collectionId}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowFacebookModal(true)}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <PostsGrid collectionId={collectionId} />
        </div>
      </div>

      <AIGenerationModal 
        open={showAIModal} 
        onOpenChange={setShowAIModal}
        collectionId={collectionId}
      />
      <FacebookFetchModal
        open={showFacebookModal}
        onOpenChange={setShowFacebookModal}
        collectionId={collectionId}
      />
    </div>
  )
} 