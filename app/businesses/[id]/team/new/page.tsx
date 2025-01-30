"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { VideoUpload } from '@/app/components/ui/video-upload'
import { StaffIntroForm } from '@/app/components/business/staff-intro-form'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function NewStaffIntroPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'RECORD' | 'DETAILS'>('RECORD')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>()
  const [videoData, setVideoData] = useState<{
    assetId: string
    playbackId: string
    thumbnailUrl: string
  } | null>(null)
  const [transcribedData, setTranscribedData] = useState({
    first_name: '',
    role: '',
    favorite_spot: ''
  })

  const createStaffIntroMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('business_staff_intros')
        .insert({
          business_id: businessId,
          first_name: data.first_name,
          role: data.role,
          favorite_spot: data.favorite_spot,
          thumbnail_url: thumbnailUrl!,
          video_asset_id: videoData!.assetId,
          video_playback_id: videoData!.playbackId
        })

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Team member added successfully')
      router.push(`/businesses/${businessId}/team`)
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save team member')
    }
  })

  const handleVideoSuccess = async (data: any) => {
    setVideoData(data)
    setThumbnailUrl(data.thumbnailUrl)
    setStep('DETAILS')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Add Team Member</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="w-full max-w-[540px]">
          {step === 'RECORD' && (
            <VideoUpload
              onSuccess={handleVideoSuccess}
            />
          )}

          {step === 'DETAILS' && videoData && (
            <StaffIntroForm
              initialData={transcribedData}
              thumbnailUrl={thumbnailUrl!}
              videoData={videoData}
              onSubmit={createStaffIntroMutation.mutate}
            />
          )}
        </div>
      </div>
    </div>
  )
} 