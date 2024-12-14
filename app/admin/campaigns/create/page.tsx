"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignForm } from "../components/campaign-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCampaignPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const { error, data: campaign } = await supabase
        .from('campaigns')
        .insert([{
          ...data,
          sent_at: null
        }])
        .select()
        .single()

      if (error) throw error
      return campaign
    },
    onSuccess: () => {
      toast.success("Campaign created successfully")
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      router.push('/admin/campaigns')
    },
    onError: (error: any) => {
      toast.error("Failed to create campaign", {
        description: error.message
      })
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignForm
              onSubmit={createCampaign.mutate}
              isSubmitting={createCampaign.isPending}
              submitLabel="Create Campaign"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 