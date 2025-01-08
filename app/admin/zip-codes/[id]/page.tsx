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
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: zipCode, isLoading } = useQuery({
    queryKey: ['zip-codes', params.id],
    queryFn: async () => {
      // First get the zip code basic data
      const { data: zipCodeData, error: zipError } = await supabase
        .from('zip_codes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (zipError) throw zipError;

      // Then get the most recent status
      const { data: statusData, error: statusError } = await supabase
        .from('zip_code_status')
        .select('*')
        .eq('zip_code_id', params.id)
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (statusError && statusError.code !== 'PGRST116') throw statusError; // Ignore "no rows returned" error

      // Combine the data
      return {
        ...zipCodeData,
        zip_code_status: statusData || null
      };
    }
  })

  const updateZipCode = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error("User not authenticated")

      // Update zip code basic info
      const { error } = await supabase
        .from('zip_codes')
        .update({
          code: data.code,
          city: data.city,
          state: data.state,
        })
        .eq('id', params.id)

      if (error) throw error

      // Handle status update
      const currentStatus = zipCode?.zip_code_status

      // If there's a status change or reason change
      if (data.is_active !== currentStatus?.is_active || data.reason !== currentStatus?.reason) {
        // End current status if it exists
        if (currentStatus?.id) {
          const { error: endError } = await supabase
            .from('zip_code_status')
            .update({ end_date: new Date().toISOString() })
            .eq('id', currentStatus.id)

          if (endError) throw endError
        }

        // Create new status
        const { error: statusError } = await supabase
          .from('zip_code_status')
          .insert([{
            zip_code_id: params.id,
            is_active: data.is_active,
            start_date: new Date().toISOString(),
            reason: data.reason || null,
            created_by: user.id
          }])

        if (statusError) throw statusError
      }
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
              onSubmit={(data) => updateZipCode.mutate(data)}
              isSubmitting={updateZipCode.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 