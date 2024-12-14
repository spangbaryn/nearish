"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PromptForm } from "../components/prompt-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreatePromptPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createPrompt = useMutation({
    mutationFn: async (data: any) => {
      const { error, data: prompt } = await supabase
        .from('ai_prompts')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return prompt
    },
    onSuccess: () => {
      toast.success("Prompt created successfully")
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      router.push('/admin/prompts')
    },
    onError: (error: any) => {
      toast.error("Failed to create prompt", {
        description: error.message
      })
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/prompts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create AI Prompt</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm
              onSubmit={createPrompt.mutate}
              isSubmitting={createPrompt.isPending}
              submitLabel="Create Prompt"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 