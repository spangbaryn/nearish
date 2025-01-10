"use client"

import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZipCodeForm } from "../components/zip-code-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function EditZipCodePage() {
  const params = useParams()
  const id = params.id
  if (!id || Array.isArray(id)) {
    throw new Error("Invalid or missing ID");
  }
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: zipCode, isLoading } = useQuery({
    queryKey: ['zip-codes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zip_codes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    }
  })

  const updateZipCode = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('zip_codes')
        .update({
          code: data.code,
          city: data.city,
          state: data.state,
          is_active: data.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Zip code updated successfully")
      queryClient.invalidateQueries({ queryKey: ['zip-codes'] })
      router.push('/admin/zip-codes')
    },
    onError: (error: any) => {
      toast.error("Failed to update zip code", {
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
          <Link href="/admin/zip-codes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Zip Code</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zip Code Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ZipCodeForm
              zipCode={zipCode}
              onSubmit={data => updateZipCode.mutate(data)}
              isSubmitting={updateZipCode.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 