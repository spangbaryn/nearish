// components/business/add-staff-intro-dialog.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { VideoRecorder } from '../../components/ui/video-recorder'
import { ThumbnailCapture } from '../../components/business/thumbnail-capture'
import { StaffIntroForm } from './staff-intro-form'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppError } from '@/lib/errors'

const staffIntroSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  role: z.string().min(1, "Role is required"),
  favorite_spot: z.string().optional(),
  video: z.object({
    assetId: z.string(),
    playbackId: z.string(),
    thumbnailUrl: z.string()
  })
})

type StaffIntroFormValues = z.infer<typeof staffIntroSchema>

interface AddStaffIntroDialogProps {
  businessId: string
  onSuccess?: () => void
}

export function AddStaffIntroDialog({ businessId, onSuccess }: AddStaffIntroDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'THUMBNAIL' | 'RECORD' | 'DETAILS'>('THUMBNAIL')
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

  const queryClient = useQueryClient()

  const createStaffIntroMutation = useMutation({
    mutationFn: async (data: StaffIntroFormValues) => {
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
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save team member')
    }
  })

  const extractInfoFromTranscription = async (transcription: string) => {
    try {
      const response = await fetch('/api/analyze-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription })
      });
      
      if (!response.ok) {
        throw new AppError('TranscriptionError', 'Failed to analyze transcription');
      }
      
      return await response.json();
    } catch (error) {
      handleError(error);
      return {
        first_name: '',
        role: '',
        favorite_spot: ''
      };
    }
  };

  const handleVideoSuccess = async (data: any) => {
    setVideoData(data);
    if (data.transcription) {
      try {
        const extractedInfo = await extractInfoFromTranscription(data.transcription);
        console.log('Extracted Info:', extractedInfo); // For debugging
        
        // Only update state if we got valid data back
        if (extractedInfo && typeof extractedInfo === 'object') {
          setTranscribedData({
            first_name: extractedInfo.first_name || '',
            role: extractedInfo.role || '',
            favorite_spot: extractedInfo.favorite_spot || ''
          });
        } else {
          console.error('Invalid response format from transcription analysis');
        }
      } catch (error) {
        console.error('Failed to extract info:', error);
        // Set empty values on error
        setTranscribedData({
          first_name: '',
          role: '',
          favorite_spot: ''
        });
      }
    }
    setStep('DETAILS');
  };

  const handleTranscriptionData = (data: Record<string, string>) => {
    setTranscribedData({
      first_name: data.first_name || '',
      role: data.role || '',
      favorite_spot: data.favorite_spot || ''
    });
  };

  const handleFormSubmit = (data: StaffIntroFormValues) => {
    createStaffIntroMutation.mutate(data)
  }

  const patterns = {
    first_name: /(?:my name is|i'm|i am)\s*([a-zA-Z]+)/i,
    role: /(?:i(?:'m| am)(?: a| the)?|my role is)\s*([a-zA-Z\s]+?)(?:\s+(?:here|at|for)|\s*$)/i,
    favorite_spot: /(?:favorite (?:local|spot|place)|like to go to|hang out at) is\s*([^.,]+?)(?:\s*(?:because|and|where|which|.|$))/i
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        {step === 'THUMBNAIL' && (
          <ThumbnailCapture 
            onCapture={(url) => {
              setThumbnailUrl(url)
              setStep('RECORD')
            }}
          />
        )}

        {step === 'RECORD' && thumbnailUrl && (
          <VideoRecorder
            onSuccess={handleVideoSuccess}
            onTranscriptionData={handleTranscriptionData}
          />
        )}

        {step === 'DETAILS' && videoData && (
          <StaffIntroForm
            initialData={transcribedData}
            thumbnailUrl={thumbnailUrl!}
            videoData={videoData}
            onSubmit={handleFormSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}