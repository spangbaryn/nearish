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
          place_id: string | null
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
      email_lists: {
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
      profile_list_subscriptions: {
        Row: {
          profile_id: string
          list_id: string
          unsubscribed_at: string | null
          created_at: string
        }
        Insert: {
          profile_id: string
          list_id: string
          unsubscribed_at?: string | null
        }
        Update: {
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_list_subscriptions_list_id_fkey"
            columns: ["list_id"]
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_list_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      zip_codes: {
        Row: {
          id: string
          code: string
          city: string
          state: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          code: string
          city: string
          state: string
          is_active?: boolean
        }
        Update: {
          code?: string
          city?: string
          state?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      zip_code_status: {
        Row: {
          id: string
          zip_code_id: string
          is_active: boolean
          start_date: string
          end_date: string | null
          campaign_id: string | null
          reason: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          zip_code_id: string
          is_active: boolean
          start_date: string
          end_date?: string | null
          campaign_id?: string | null
          reason?: string | null
          created_by: string
        }
        Update: {
          is_active?: boolean
          end_date?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zip_code_status_zip_code_id_fkey"
            columns: ["zip_code_id"]
            referencedRelation: "zip_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zip_code_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'admin' | 'business' | 'customer'
          zip_code: string | null
          onboarded: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'business' | 'customer'
          zip_code?: string | null
          onboarded?: boolean
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'business' | 'customer'
          zip_code?: string | null
          onboarded?: boolean
          updated_at?: string
        }
      }
      places: {
        Row: {
          place_id: string
          name: string
          formatted_address: string
          phone_number: string | null
          website: string | null
          logo_url: string | null
          last_synced_at: string
        }
        Insert: {
          place_id: string
          name: string
          formatted_address: string
          phone_number?: string | null
          website?: string | null
          logo_url?: string | null
          last_synced_at: string
        }
        Update: {
          name?: string
          formatted_address?: string
          phone_number?: string | null
          website?: string | null
          logo_url?: string | null
          last_synced_at?: string
        }
      }
      // ... other tables
    }
  }
} 