"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { AddStaffIntroDialog } from "../business/add-staff-intro-dialog"
import { MuxVideoPlayer } from "../../components/ui/mux-video-player"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, MapPin, ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { EditStaffIntroDialog } from "./edit-staff-intro-dialog"
import { cn } from "@/lib/utils"
import { VideoViewingOverlay } from "@/app/components/ui/video-viewing-overlay"
import { VideoInteractiveOverlay } from "@/app/components/ui/VideoInteractiveOverlay"
import type { VideoItem } from "@/app/components/ui/video-viewing-overlay"
import { Database } from "@/types/database.types"

type StaffIntro = Database["public"]["Tables"]["business_staff_intros"]["Row"]

interface StaffIntroSectionProps {
  businessId: string
  color?: string
  readOnly?: boolean
}

export function StaffIntroSection({ businessId, color = "#000000", readOnly = false }: StaffIntroSectionProps) {
  const queryClient = useQueryClient()
  const [editingIntro, setEditingIntro] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIntro, setSelectedIntro] = useState<any>(null)
  const [selectedMobileIntro, setSelectedMobileIntro] = useState<any>(null)
  const [isMobileVideoMuted, setIsMobileVideoMuted] = useState(true)
  const [isMobileVideoPaused, setIsMobileVideoPaused] = useState(false)
  const [mobileVideoTime, setMobileVideoTime] = useState(0)
  const [mobileVideoDuration, setMobileVideoDuration] = useState(0)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const mobileVideoRef = useRef<any>(null)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

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
      queryClient.invalidateQueries({ queryKey: ['business-staff', businessId] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove team member')
    }
  })

  const getCardsPerPage = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth < 640) return 1  // mobile
    if (window.innerWidth < 1024) return 2 // tablet
    return 4 // desktop
  }

  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage())

  useEffect(() => {
    const handleResize = () => {
      setCardsPerPage(getCardsPerPage())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalPages = Math.ceil((staffIntros?.length || 0) / cardsPerPage)
  const isFirstPage = currentIndex === 0
  const isLastPage = currentIndex === totalPages - 1

  const handlePrevious = () => {
    if (staffIntros) {
      const currentIdx = staffIntros.findIndex(intro => intro.id === selectedMobileIntro?.id)
      const prevIdx = currentIdx === 0 ? staffIntros.length - 1 : currentIdx - 1
      setSelectedMobileIntro(staffIntros[prevIdx])
    }
  }

  const handleNext = () => {
    if (staffIntros) {
      const currentIdx = staffIntros.findIndex(intro => intro.id === selectedMobileIntro?.id)
      const nextIdx = currentIdx === staffIntros.length - 1 ? 0 : currentIdx + 1
      setSelectedMobileIntro(staffIntros[nextIdx])
    }
  }

  const handleCarouselPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleCarouselNext = () => {
    setCurrentIndex(prev => Math.min(totalPages - 1, prev + 1))
  }

  const handleIntroClick = (intro: StaffIntro) => {
    if (!staffIntros) return;
    
    const videoItems = staffIntros.map(intro => ({
      id: intro.id,
      title: intro.first_name,
      subtitle: intro.role,
      description: intro.favorite_spot || undefined,
      video_playback_id: intro.video_playback_id,
      video_asset_id: intro.video_asset_id,
      thumbnail_url: intro.thumbnail_url
    }))
    
    setSelectedVideo({
      items: videoItems,
      currentId: intro.id,
      onClose: () => setSelectedVideo(null)
    })
  }

  useEffect(() => {
    if (staffIntros && staffIntros.length > 0 && !selectedMobileIntro) {
      setSelectedMobileIntro(staffIntros[0])
    }
  }, [staffIntros])

  // Add effect to scroll avatar into view when video changes
  useEffect(() => {
    if (selectedMobileIntro && avatarScrollRef.current) {
      const avatarElement = avatarScrollRef.current.querySelector(`[data-intro-id="${selectedMobileIntro.id}"]`)
      if (avatarElement) {
        avatarElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [selectedMobileIntro?.id])

  const handleShare = () => {
    if (selectedMobileIntro) {
      if (navigator.share) {
        navigator.share({
          title: selectedMobileIntro.first_name,
          text: selectedMobileIntro.role,
          url: window.location.href
        }).catch(console.error)
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="h-8 w-1 rounded-full"
            style={{ backgroundColor: color || "#000000" }}
          />
          <h2 className="text-2xl font-bold text-black">
            Team Intros
          </h2>
        </div>
        {!readOnly && (
          <AddStaffIntroDialog businessId={businessId} />
        )}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : staffIntros?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No team members added yet
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="sm:hidden">
            {/* Avatar Carousel */}
            <div 
              ref={avatarScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide snap-x snap-mandatory"
            >
              {staffIntros?.map((intro) => (
                <button
                  key={intro.id}
                  data-intro-id={intro.id}
                  onClick={() => setSelectedMobileIntro(intro)}
                  className={cn(
                    "flex-shrink-0 relative w-20 h-20 rounded-full overflow-hidden border-2 snap-center",
                    selectedMobileIntro?.id === intro.id ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"
                  )}
                >
                  <img
                    src={intro.thumbnail_url}
                    alt={intro.first_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-xs text-white text-center truncate">
                      {intro.first_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Member Video */}
            {selectedMobileIntro && (
              <div className="mt-4 px-4">
                <div className="max-w-[280px] mx-auto aspect-[9/16] relative rounded-lg overflow-hidden">
                  <MuxVideoPlayer
                    ref={mobileVideoRef}
                    playbackId={selectedMobileIntro.video_playback_id}
                    className="w-full h-full"
                    autoPlay={true}
                    muted={isMobileVideoMuted}
                    controls={false}
                    hidePlayButton={true}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setMobileVideoTime(video.currentTime || 0);
                    }}
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setMobileVideoDuration(video.duration || 0);
                    }}
                    onPausedChange={setIsMobileVideoPaused}
                    onEnded={() => {
                      if (staffIntros && staffIntros.length > 1) {
                        handleNext();
                      }
                    }}
                  />
                  <VideoInteractiveOverlay
                    className="absolute inset-0"
                    isMuted={isMobileVideoMuted}
                    isPaused={isMobileVideoPaused}
                    currentTime={mobileVideoTime}
                    duration={mobileVideoDuration}
                    header={selectedMobileIntro.first_name}
                    subheader={selectedMobileIntro.role}
                    posterInfo={selectedMobileIntro.favorite_spot}
                    onToggleMute={() => setIsMobileVideoMuted(!isMobileVideoMuted)}
                    onTogglePlay={() => {
                      if (mobileVideoRef.current) {
                        if (isMobileVideoPaused) {
                          mobileVideoRef.current.play();
                        } else {
                          mobileVideoRef.current.pause();
                        }
                      }
                    }}
                    onPrev={() => staffIntros && staffIntros.length > 1 && handlePrevious()}
                    onNext={() => staffIntros && staffIntros.length > 1 && handleNext()}
                    onShare={handleShare}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block relative px-4 sm:px-0">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div 
                    key={pageIndex}
                    className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {staffIntros
                      ?.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage)
                      .map((intro) => (
                        <div 
                          key={intro.id} 
                          className="relative bg-card rounded-xl overflow-hidden border shadow-lg hover:shadow-xl transition-all aspect-[4/5] sm:aspect-[3/4] group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleIntroClick(intro);
                          }}
                        >
                          <img
                            src={intro.thumbnail_url}
                            alt={intro.first_name}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-0"
                          />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
                                  preload="metadata"
                                  playsInline={true}
                                  startTime={0}
                                  streamType="on-demand"
                                  preferPlayback="mse"
                                  disableToggle
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
                                {!readOnly && (
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
                                        onSelect={() => {
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
                                )}
                              </div>
                              <p className="text-lg text-white/80">{intro.role}</p>
                            </div>
                          </div>

                          {/* Favorite spot section */}
                          <div className="absolute inset-x-0 bottom-0 p-2 group-hover:hidden">
                            {intro.favorite_spot && (
                              <div className="flex flex-col text-sm bg-black/20 backdrop-blur-sm rounded-md py-1.5 px-2">
                                <span className="text-white/70 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                                  Local Spot I <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                                </span>
                                <div className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1 text-white/90" />
                                  <span className="text-white font-medium text-sm">{intro.favorite_spot}</span>
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
                    className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={handleCarouselPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {!isLastPage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={handleCarouselNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}

      {editingIntro && (
        <EditStaffIntroDialog
          businessId={businessId}
          intro={staffIntros?.find(i => i.id === editingIntro)!}
          open={!!editingIntro}
          onOpenChange={(open) => !open && setEditingIntro(null)}
        />
      )}

      {selectedVideo && (
        <VideoViewingOverlay 
          {...selectedVideo} 
          onClose={() => setSelectedVideo(null)}
          color={color}
        />
      )}
    </div>
  )
}