"use client"

import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignForm } from "../components/campaign-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, SendHorizontal } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"
import { SubscribersTable } from "../components/subscribers-table"
import { EmailPreview } from "../components/email-preview"

export default function EditCampaignPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          email_templates (
            id,
            name,
            subject,
            content
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    }
  })

  const updateCampaign = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('campaigns')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      toast("Campaign updated successfully")
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      router.push('/admin/campaigns')
    },
    onError: (error: any) => {
      toast.error("Failed to update campaign", {
        description: error.message
      })
    }
  })

  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    try {
      console.log('1. Starting campaign send...');
      setIsSending(true);
      
      console.log('2. Making fetch request...');
      const response = await fetch(`/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('3. Fetch response received:', response.status);
      
      let data;
      try {
        console.log('4. Parsing response...');
        data = await response.json();
        console.log('5. Parsed response:', data);
      } catch (e) {
        console.log('5a. Parse error:', e);
        throw new Error('Invalid server response');
      }
      
      if (!response.ok) {
        console.log('6a. Response not OK:', { status: response.status, data });
        throw new Error(data?.error || `Server error: ${response.status}`);
      }
      

      
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
    } catch (error: any) {
      console.log('7. Caught error:', {
        message: error?.message,
        status: error?.status,
        name: error?.name,
        stack: error?.stack
      });
      
      toast.error("Failed to send campaign: " + (error?.message || "An unexpected error occurred"))
    } finally {
      setIsSending(false);
    }
  }

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin/campaigns">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Edit Campaign</h1>
              <div className="ml-auto">
                <Button 
                  onClick={handleSend} 
                  disabled={isSending || campaign?.sent_at}
                >
                  <SendHorizontal className="h-4 w-4 mr-2" />
                  {isSending ? "Sending..." : "Send Campaign"}
                </Button>
              </div>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignForm
                  campaign={campaign}
                  onSubmit={updateCampaign.mutate}
                  isSubmitting={updateCampaign.isPending}
                  submitLabel="Save Changes"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Audience</CardTitle>
              </CardHeader>
              <CardContent>
                <SubscribersTable listId={campaign?.list_id} />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-7">
            <EmailPreview
              subject={campaign?.email_templates?.subject}
              content={campaign?.email_templates?.content}
              collectionId={campaign?.collection_id}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 