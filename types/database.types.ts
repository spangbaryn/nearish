export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          brand_color: string
          logo_url: string | null
          is_published: boolean
          public_url_slug: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          name: string
          brand_color?: string
          logo_url?: string | null
          is_published?: boolean
          public_url_slug?: string | null
        }
        Update: {
          name?: string
          brand_color?: string
          logo_url?: string | null
          is_published?: boolean
          public_url_slug?: string | null
          published_at?: string | null
        }
      }
      business_staff_intros: {
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
      business_timeline_events: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string
          date: string
          media_url?: string | null
          created_by: string
          created_at: string
          updated_at?: string | null
        }
        Insert: {
          business_id: string
          title: string
          description: string
          date: string
          media_url?: string | null
          created_by: string
        }
        Update: {
          title?: string
          description?: string
          date?: string
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_timeline_events_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          collection_id: string
          template_id: string
          sent_at: string | null
          created_at: string
          list_id?: string
        }
        Insert: {
          collection_id: string
          template_id: string
          list_id?: string
          sent_at?: string | null
        }
        Update: {
          collection_id?: string
          template_id?: string
          list_id?: string
          sent_at?: string | null
        }
      }
      // ... other tables
    }
  }
} 