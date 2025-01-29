interface Database {
  public: {
    Tables: {
      businesses_staff_intros: {
        Row: {
          id: string
          business_id: string
          first_name: string
          role: string
          favorite_spot: string | null
          thumbnail_url: string
          video_asset_id: string
          video_playback_id: string
          created_at: string
        }
        Insert: {
          business_id: string
          first_name: string
          role: string
          favorite_spot?: string | null
          thumbnail_url: string
          video_asset_id: string
          video_playback_id: string
        }
        Update: {
          first_name?: string
          role?: string
          favorite_spot?: string | null
        }
      }
      // ... other tables
    }
  }
} 