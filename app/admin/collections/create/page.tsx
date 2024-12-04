"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { RequireAdmin } from "../../components/require-admin"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollectionForm } from "../components/collection-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCollectionPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createCollection = useMutation({
    mutationFn: async (data: any) => {
      const { error, data: collection } = await supabase
        .from('collections')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return collection
    },
    onSuccess: () => {
      toast.success("Collection created successfully")
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      router.push('/admin/collections')
    },
    onError: (error: any) => {
      toast.error("Failed to create collection", {
        description: error.message
      })
    }
  })

  return (
    <AuthenticatedLayout>
      <RequireAdmin>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/collections">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create Collection</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CollectionForm
                  onSubmit={createCollection.mutate}
                  isSubmitting={createCollection.isPending}
                  submitLabel="Create Collection"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireAdmin>
    </AuthenticatedLayout>
  )
} 