"use client"

import { useParams } from "next/navigation"
import React from "react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { RequireAdmin } from "../../components/require-admin"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateForm } from "../components/template-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function EditTemplatePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: template, isLoading } = useQuery({
    queryKey: ['templates', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('email_templates')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Template updated successfully")
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      router.push('/admin/templates')
    },
    onError: (error: any) => {
      toast.error("Failed to update template", {
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
    <AuthenticatedLayout>
      <RequireAdmin>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/templates">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Edit Template</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateForm
                  template={template}
                  onSubmit={updateTemplate.mutate}
                  isSubmitting={updateTemplate.isPending}
                  submitLabel="Save Changes"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireAdmin>
    </AuthenticatedLayout>
  )
} 