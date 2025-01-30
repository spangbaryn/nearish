import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StaffIntroForm } from "./staff-intro-form"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface EditStaffIntroDialogProps {
  businessId: string
  intro: {
    id: string
    first_name: string
    role: string
    favorite_spot: string | null
    video_playback_id: string
    thumbnail_url: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStaffIntroDialog({ businessId, intro, open, onOpenChange }: EditStaffIntroDialogProps) {
  const queryClient = useQueryClient()

  const updateStaffIntroMutation = useMutation({
    mutationFn: async (data: {
      first_name: string
      role: string
      favorite_spot?: string
    }) => {
      const { error } = await supabase
        .from('business_staff_intros')
        .update({
          first_name: data.first_name,
          role: data.role,
          favorite_spot: data.favorite_spot,
        })
        .eq('id', intro.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Team member updated successfully')
      onOpenChange(false)
      queryClient.invalidateQueries({ 
        queryKey: ['business-staff', businessId] 
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update team member')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <StaffIntroForm
          initialData={{
            first_name: intro.first_name,
            role: intro.role,
            favorite_spot: intro.favorite_spot || '',
          }}
          thumbnailUrl={intro.thumbnail_url}
          videoData={{
            assetId: '',
            playbackId: intro.video_playback_id,
            thumbnailUrl: intro.thumbnail_url
          }}
          onSubmit={updateStaffIntroMutation.mutate}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
} 