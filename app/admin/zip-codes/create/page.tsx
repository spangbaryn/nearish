"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ZipCodeForm } from "../components/zip-code-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function CreateZipCodePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const createZipCode = useMutation({
    mutationFn: async (data: any) => {
      const { error, data: zipCode } = await supabase
        .from('zip_codes')
        .insert([{
          code: data.code,
          city: data.city,
          state: data.state,
          is_active: data.is_active,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return zipCode
    },
    onSuccess: () => {
      toast.success("Zip code created successfully")
      queryClient.invalidateQueries({ queryKey: ['zip-codes'] })
      router.push('/admin/zip-codes')
    },
    onError: (error: any) => {
      toast.error("Failed to create zip code", {
        description: error.message
      })
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/zip-codes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add Zip Code</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zip Code Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ZipCodeForm
              onSubmit={createZipCode.mutate}
              isSubmitting={createZipCode.isPending}
              submitLabel="Add Zip Code"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 