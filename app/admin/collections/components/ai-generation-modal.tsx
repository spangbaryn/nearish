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

interface AIGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
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
          <Button>
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}