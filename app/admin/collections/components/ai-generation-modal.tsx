"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { AIPrompt } from "@/types/prompts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { replaceDynamicTags } from "../../../lib/prompt-utils"

interface AIGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
}

type PostData = {
  id: string;
  business_id: string | null;
  content: string;
  created_at: string;
  external_id: string | null;
  facebook_page_id: string | null;
  facebook_post_id: string | null;
  final_content: string | null;
  final_type: 'Promotion' | 'Event' | 'Update' | null;
  included: boolean | null;
  platform: string | null;
  published_at: string | null;
  source: "facebook" | "admin" | "platform";
  updated_at: string | null;
  url: string | null;
  ai_generated_content: string | null;
  ai_generated_type: string | null;
  businesses: {
    name: string;
  } | null | undefined;
}

export function AIGenerationModal({ open, onOpenChange, collectionId }: AIGenerationModalProps) {
  const queryClient = useQueryClient()
  const [selectedContentPrompt, setSelectedContentPrompt] = useState<AIPrompt | null>(null)
  const [selectedTypePrompt, setSelectedTypePrompt] = useState<AIPrompt | null>(null)

  // Fetch collection's current prompts
  const { data: collectionPrompts } = useQuery({
    queryKey: ['collection-prompts', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_prompts')
        .select('ai_prompts (*)')
        .eq('collection_id', collectionId)

      if (error) throw error
      return (data || []).map(cp => cp.ai_prompts) as unknown as AIPrompt[]
    },
    enabled: !!collectionId
  })
 
  // Fetch all available prompts
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as AIPrompt[]
    }
  })

  // Filter prompts by type
  const contentPrompts = prompts?.filter(p => p.prompt_type === 'content') || []
  const typePrompts = prompts?.filter(p => p.prompt_type === 'type_id') || []

  // Set initial prompts based on collection's existing associations or defaults
  useEffect(() => {
    if (prompts && collectionPrompts) {
      const existingContent = collectionPrompts.find(p => p.prompt_type === 'content')
      const existingType = collectionPrompts.find(p => p.prompt_type === 'type_id')
      
      setSelectedContentPrompt(
        existingContent || 
        contentPrompts.find(p => p.is_default) || 
        contentPrompts[0]
      )
      
      setSelectedTypePrompt(
        existingType || 
        typePrompts.find(p => p.is_default) || 
        typePrompts[0]
      )
    }
  }, [prompts, collectionPrompts])

  const handleContentPromptChange = (promptId: string) => {
    const prompt = prompts?.find(p => p.id === promptId) || null
    setSelectedContentPrompt(prompt)
  }

  const handleTypePromptChange = (promptId: string) => {
    const prompt = prompts?.find(p => p.id === promptId) || null
    setSelectedTypePrompt(prompt)
  }

  const savePrompts = useMutation({
    mutationFn: async () => {
      // Delete existing prompts for this collection
      const { error: deleteError } = await supabase
        .from('collection_prompts')
        .delete()
        .eq('collection_id', collectionId)

      if (deleteError) throw deleteError

      // Insert new prompts
      const newPrompts = [
        selectedContentPrompt?.id,
        selectedTypePrompt?.id
      ].filter(Boolean).map(promptId => ({
        collection_id: collectionId,
        prompt_id: promptId
      }))

      if (newPrompts.length > 0) {
        const { error: insertError } = await supabase
          .from('collection_prompts')
          .insert(newPrompts)

        if (insertError) throw insertError
      }
    },
    onSuccess: () => {
      toast.success("Prompts saved successfully")
      queryClient.invalidateQueries({ queryKey: ['collection-prompts', collectionId] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error("Failed to save prompts", {
        description: error.message
      })
    }
  })

  const generateContent = useMutation({
    mutationFn: async () => {
      // Get posts in collection
      const { data: postsInCollection, error: junctionError } = await supabase
        .from("posts_collections")
        .select("post_id")
        .eq("collection_id", collectionId)

      if (junctionError) throw junctionError
      if (!postsInCollection?.length) throw new Error("No posts found in collection")

      const postIds = postsInCollection.map(pc => pc.post_id)
      
      // Get posts with business data
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          businesses (
            name
          )
        `)
        .in("id", postIds)

      if (postsError) throw postsError
      if (!selectedContentPrompt) throw new Error("No content prompt selected")
      if (!selectedTypePrompt) throw new Error("No type prompt selected")

      // Process each post with ChatGPT
      const updates = await Promise.all(
        posts.map(async (post) => {
          // Generate content
          const contentPrompt = replaceDynamicTags(selectedContentPrompt.prompt, post)
          const contentResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: contentPrompt
            })
          })

          if (!contentResponse.ok) {
            throw new Error(`Content generation failed for post ${post.id}`)
          }

          const { generatedContent } = await contentResponse.json()

          // Generate type
          const typePrompt = replaceDynamicTags(selectedTypePrompt.prompt, post)
          const typeResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: typePrompt
            })
          })

          if (!typeResponse.ok) {
            throw new Error(`Type generation failed for post ${post.id}`)
          }

          const { generatedContent: generatedType } = await typeResponse.json()

          // Return properly formatted update object
          return {
            id: post.id,
            ai_generated_content: generatedContent,
            final_content: generatedContent,
            ai_generated_type: generatedType,
            final_type: generatedType,
            updated_at: new Date().toISOString()
          }
        })
      )

      // Update posts one by one to avoid batch update issues
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(update)
          .eq('id', update.id)

        if (updateError) throw updateError
      }

      return updates
    },
    onSuccess: () => {
      toast.success("Content generated successfully")
      queryClient.invalidateQueries({ queryKey: ['posts', collectionId] })
    },
    onError: (error: any) => {
      console.error('Generation error:', error)
      toast.error("Failed to generate content", {
        description: error.message
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI Generation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Content Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <Select 
                    onValueChange={handleContentPromptChange}
                    defaultValue={selectedContentPrompt?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentPrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.name} {prompt.is_default && "⭐"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedContentPrompt && (
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {selectedContentPrompt.prompt}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type ID Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <Select 
                    onValueChange={handleTypePromptChange}
                    defaultValue={selectedTypePrompt?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      {typePrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.name} {prompt.is_default && "⭐"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTypePrompt && (
                    <div className="text-sm bg-muted p-3 rounded-md">
                      {selectedTypePrompt.prompt}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="secondary"
            onClick={() => savePrompts.mutate()}
            disabled={savePrompts.isPending}
          >
            {savePrompts.isPending ? "Saving..." : "Save Prompts"}
          </Button>
          <Button
            onClick={() => generateContent.mutate()}
            disabled={generateContent.isPending || !selectedContentPrompt}
          >
            {generateContent.isPending ? "Generating..." : "Generate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}