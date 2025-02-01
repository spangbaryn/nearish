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
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          name: string
          description?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          updated_at?: string | null
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
      posts: {
        Row: {
          id: string
          business_id: string
          content: string
          final_content: string | null
          final_type: 'Promotion' | 'Event' | 'Update' | null
          included: boolean | null
          source: 'facebook' | 'admin' | 'platform'
          created_at: string
          ai_generated_content: string | null
          ai_generated_type: string | null
          updated_at: string | null
          businesses?: {
            id: string
            name: string
          }
        }
        Insert: {
          business_id: string
          content: string
          final_content?: string | null
          final_type?: 'Promotion' | 'Event' | 'Update' | null
          included?: boolean
          source: 'facebook' | 'admin' | 'platform'
          ai_generated_content?: string | null
          ai_generated_type?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content?: string
          final_content?: string | null
          final_type?: 'Promotion' | 'Event' | 'Update' | null
          included?: boolean
          source?: 'facebook' | 'admin' | 'platform'
          ai_generated_content?: string | null
          ai_generated_type?: string | null
          updated_at?: string | null
        }
      }
      posts_collections: {
        Row: {
          post_id: string
          collection_id: string
        }
        Insert: {
          post_id: string
          collection_id: string
        }
        Update: {
          post_id?: string
          collection_id?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          type: 'transactional' | 'campaign'
          content: string
          created_at: string
        }
        Insert: {
          name: string
          subject: string
          type: 'transactional' | 'campaign'
          content: string
        }
        Update: {
          name?: string
          subject?: string
          type?: 'transactional' | 'campaign'
          content?: string
        }
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          profile_id: string
          role: 'owner' | 'admin' | 'staff'
          created_at: string
        }
        Insert: {
          business_id: string
          profile_id: string
          role: 'owner' | 'admin' | 'staff'
        }
        Update: {
          role?: 'owner' | 'admin' | 'staff'
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other tables
    }
  }
} 