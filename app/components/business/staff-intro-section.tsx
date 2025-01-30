import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { AddStaffIntroDialog } from "../business/add-staff-intro-dialog"
import { MuxVideoPlayer } from "../../components/ui/mux-video-player"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, MapPin, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState } from "react"
import { EditStaffIntroDialog } from "./edit-staff-intro-dialog"
import { cn } from "@/lib/utils"
import { StaffIntroOverlay } from "./staff-intro-overlay"

interface StaffIntroSectionProps {
  businessId: string
  color?: string
}

export function StaffIntroSection({ businessId, color = "#000000" }: StaffIntroSectionProps) {
  const queryClient = useQueryClient()
  const [editingIntro, setEditingIntro] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIntro, setSelectedIntro] = useState<any>(null)

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

  const cardsPerPage = 4
  const totalPages = Math.ceil((staffIntros?.length || 0) / cardsPerPage)
  const isFirstPage = currentIndex === 0
  const isLastPage = currentIndex === totalPages - 1

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  const handleIntroClick = (intro: any) => {
    setSelectedIntro(intro)
  }

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
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div 
                  key={pageIndex}
                  className="w-full flex-shrink-0 grid grid-cols-4 gap-4 px-4"
                >
                  {staffIntros
                    ?.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage)
                    .map((intro) => (
                      <div 
                        key={intro.id} 
                        className="relative bg-card rounded-xl overflow-hidden border shadow-lg hover:shadow-xl transition-all aspect-[3/4] group cursor-pointer"
                        onClick={() => handleIntroClick(intro)}
                      >
                        <img
                          src={intro.thumbnail_url}
                          alt={intro.first_name}
                          className="w-full h-full object-cover transition-opacity group-hover:opacity-0"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="w-[105%] aspect-[9/16]">
                              <MuxVideoPlayer
                                playbackId={intro.video_playback_id}
                                className="w-full h-full rounded-lg"
                                autoPlay={true}
                                muted={true}
                                loop={true}
                                controls={false}
                                hidePlayButton={true}
                                preload="auto"
                                color={color}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Content - Moved to top */}
                        <div className="absolute inset-x-0 top-0 p-6 text-white z-10">
                          {/* Updated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
                          
                          {/* Content */}
                          <div className="relative z-10 space-y-0.5">
                            <div className="flex items-center justify-between">
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
                          </div>
                        </div>

                        {/* Favorite spot section - Remains at bottom */}
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          {intro.favorite_spot && (
                            <div className="flex flex-col text-sm bg-black/20 backdrop-blur-sm rounded-md py-2 px-3">
                              <span className="text-white/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                                Local Spot I <Heart className="h-3 w-3 fill-current" />
                              </span>
                              <div className="flex items-center mt-0.5">
                                <MapPin className="h-4 w-4 mr-1.5 text-white/90" />
                                <span className="text-white font-medium">{intro.favorite_spot}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
          
          {staffIntros && staffIntros.length > cardsPerPage && (
            <>
              {!isFirstPage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {!isLastPage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {editingIntro && (
        <EditStaffIntroDialog
          businessId={businessId}
          intro={staffIntros?.find(i => i.id === editingIntro)!}
          open={!!editingIntro}
          onOpenChange={(open) => !open && setEditingIntro(null)}
        />
      )}

      {selectedIntro && (
        <StaffIntroOverlay
          intro={selectedIntro}
          onClose={() => setSelectedIntro(null)}
          color={color}
        />
      )}
    </div>
  )
}