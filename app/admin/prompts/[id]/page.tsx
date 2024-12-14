"use client"

import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PromptForm } from "../components/prompt-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AIPrompt } from "@/types/prompts"

export default function EditPromptPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: prompt, isLoading } = useQuery({
    queryKey: ['prompts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as AIPrompt
    }
  })

  const updatePrompt = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('ai_prompts')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Prompt updated successfully")
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      router.push('/admin/prompts')
    },
    onError: (error: any) => {
      toast.error("Failed to update prompt", {
        description: error.message
      })
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/prompts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit AI Prompt</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm
              onSubmit={updatePrompt.mutate}
              isSubmitting={updatePrompt.isPending}
              submitLabel="Update Prompt"
              defaultValues={prompt}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 