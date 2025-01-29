import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { AddStaffIntroDialog } from "../business/add-staff-intro-dialog"
import { MuxVideoPlayer } from "../../components/ui/mux-video-player"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, MapPin, Sparkles } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState } from "react"
import { EditStaffIntroDialog } from "./edit-staff-intro-dialog"

interface StaffIntroSectionProps {
  businessId: string
}

export function StaffIntroSection({ businessId }: StaffIntroSectionProps) {
  const queryClient = useQueryClient()
  const [editingIntro, setEditingIntro] = useState<string | null>(null)

  const { data: staffIntros, isLoading } = useQuery({
    queryKey: ['business-staff', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_staff_intros')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const deleteStaffIntroMutation = useMutation({
    mutationFn: async (introId: string) => {
      const { error } = await supabase
        .from('business_staff_intros')
        .delete()
        .eq('id', introId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Team member removed')
      queryClient.invalidateQueries(['business-staff', businessId])
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove team member')
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Team Members</h2>
        <AddStaffIntroDialog businessId={businessId} />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : staffIntros?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No team members added yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffIntros?.map((intro) => (
            <div key={intro.id} className="group relative bg-card rounded-xl overflow-hidden border shadow-lg hover:shadow-xl transition-all">
              <div className="relative aspect-[3/4]">
                {/* Thumbnail/Video Container */}
                <div className="absolute inset-0">
                  <img
                    src={intro.thumbnail_url}
                    alt={intro.first_name}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-0"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MuxVideoPlayer
                      playbackId={intro.video_playback_id}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  </div>
                </div>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{intro.first_name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditingIntro(intro.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this team member?')) {
                              deleteStaffIntroMutation.mutate(intro.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-lg text-white/80">{intro.role}</p>
                  
                  {/* Quick Facts */}
                  <div className="mt-4 space-y-2 opacity-85 hover:opacity-100 transition-opacity">
                    {intro.favorite_spot && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Favorite spot: {intro.favorite_spot}</span>
                      </div>
                    )}
            
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingIntro && (
        <EditStaffIntroDialog
          businessId={businessId}
          intro={staffIntros.find(i => i.id === editingIntro)!}
          open={!!editingIntro}
          onOpenChange={(open) => !open && setEditingIntro(null)}
        />
      )}
    </div>
  )
}