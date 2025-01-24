import { Database } from "@/types/database.types"

type TimelineEvent = Database['public']['Tables']['business_timeline_events']['Row']

export type VideoStateType = 'READY' | 'PROCESSING' | 'ERROR'

export interface VideoData {
  assetId: TimelineEvent['video_asset_id']
  playbackId: TimelineEvent['video_playback_id']
  thumbnailUrl: TimelineEvent['thumbnail_url']
  duration: TimelineEvent['video_duration']
  status: TimelineEvent['video_status']
}

export interface VideoState {
  type: VideoStateType
  data?: VideoData
  error?: string
} 