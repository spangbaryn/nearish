export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean
          name: string
          prompt: string
          prompt_type: Database["public"]["Enums"]["prompt_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          name: string
          prompt: string
          prompt_type?: Database["public"]["Enums"]["prompt_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          name?: string
          prompt?: string
          prompt_type?: Database["public"]["Enums"]["prompt_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      business_members: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          position: string | null
          profile_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          profile_id?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          profile_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_social_connections: {
        Row: {
          business_id: string | null
          created_at: string | null
          external_id: string
          id: string
          name: string
          platform: Database["public"]["Enums"]["social_platform"]
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          external_id: string
          id?: string
          name: string
          platform: Database["public"]["Enums"]["social_platform"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          external_id?: string
          id?: string
          name?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_social_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_staff_intros: {
        Row: {
          business_id: string | null
          created_at: string | null
          favorite_spot: string | null
          first_name: string
          id: string
          role: string
          thumbnail_url: string
          video_asset_id: string
          video_playback_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          favorite_spot?: string | null
          first_name: string
          id?: string
          role: string
          thumbnail_url: string
          video_asset_id: string
          video_playback_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          favorite_spot?: string | null
          first_name?: string
          id?: string
          role?: string
          thumbnail_url?: string
          video_asset_id?: string
          video_playback_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_staff_intros_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_timeline_events: {
        Row: {
          business_id: string
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_asset_id: string | null
          video_duration: number | null
          video_playback_id: string | null
          video_status: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_asset_id?: string | null
          video_duration?: number | null
          video_playback_id?: string | null
          video_status?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_asset_id?: string | null
          video_duration?: number | null
          video_playback_id?: string | null
          video_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_timeline_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          brand_color: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          place_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          place_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          place_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_business_place"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      campaigns: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          list_id: string
          sent_at: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          list_id: string
          sent_at?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          list_id?: string
          sent_at?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_prompts: {
        Row: {
          collection_id: string | null
          created_at: string
          id: string
          prompt_id: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          id?: string
          prompt_id?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          id?: string
          prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_prompts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          subject: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          subject: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          created_at: string
          formatted_address: string
          id: string
          last_synced_at: string | null
          logo_url: string | null
          name: string
          phone_number: string | null
          place_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          formatted_address: string
          id?: string
          last_synced_at?: string | null
          logo_url?: string | null
          name: string
          phone_number?: string | null
          place_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          formatted_address?: string
          id?: string
          last_synced_at?: string | null
          logo_url?: string | null
          name?: string
          phone_number?: string | null
          place_id?: string
          website?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          ai_generated_content: string | null
          ai_generated_type: string | null
          business_id: string | null
          content: string
          created_at: string
          external_id: string | null
          facebook_page_id: string | null
          facebook_post_id: string | null
          final_content: string | null
          final_type: Database["public"]["Enums"]["post_type"] | null
          id: string
          included: boolean | null
          platform: string | null
          published_at: string | null
          source: Database["public"]["Enums"]["post_source"]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          ai_generated_content?: string | null
          ai_generated_type?: string | null
          business_id?: string | null
          content: string
          created_at?: string
          external_id?: string | null
          facebook_page_id?: string | null
          facebook_post_id?: string | null
          final_content?: string | null
          final_type?: Database["public"]["Enums"]["post_type"] | null
          id?: string
          included?: boolean | null
          platform?: string | null
          published_at?: string | null
          source: Database["public"]["Enums"]["post_source"]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          ai_generated_content?: string | null
          ai_generated_type?: string | null
          business_id?: string | null
          content?: string
          created_at?: string
          external_id?: string | null
          facebook_page_id?: string | null
          facebook_post_id?: string | null
          final_content?: string | null
          final_type?: Database["public"]["Enums"]["post_type"] | null
          id?: string
          included?: boolean | null
          platform?: string | null
          published_at?: string | null
          source?: Database["public"]["Enums"]["post_source"]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_collections: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_collections_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_list_subscriptions: {
        Row: {
          id: string
          list_id: string | null
          profile_id: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          list_id?: string | null
          profile_id?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          list_id?: string | null
          profile_id?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_list_subscriptions_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_list_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarded: boolean
          role: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarded?: boolean
          role: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarded?: boolean
          role?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      social_credentials: {
        Row: {
          connection_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_credentials_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "business_social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          business_id: string | null
          created_at: string
          email: string
          expires_at: string
          first_name: string
          id: string
          last_name: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          first_name: string
          id?: string
          last_name: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_facebook_pages: {
        Row: {
          access_token: string
          business_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          page_id: string
          page_name: string
        }
        Insert: {
          access_token: string
          business_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          page_id: string
          page_name: string
        }
        Update: {
          access_token?: string
          business_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          page_id?: string
          page_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "temp_facebook_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_event_videos: {
        Row: {
          created_at: string | null
          created_by: string
          event_id: string
          id: string
          thumbnail_url: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          event_id: string
          id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          event_id?: string
          id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_event_videos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "business_timeline_events"
            referencedColumns: ["id"]
          },
        ]
      }
      zip_codes: {
        Row: {
          city: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          state: string
          updated_at: string | null
        }
        Insert: {
          city: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          state: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invite:
        | {
            Args: {
              p_token: string
              p_user_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_token: string
              p_user_id: string
            }
            Returns: undefined
          }
      create_profile: {
        Args: {
          user_id: string
          user_email: string
        }
        Returns: Json
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      business_role: "Owner" | "Staff"
      post_source: "facebook" | "admin" | "platform"
      post_type: "Promotion" | "Event" | "Update"
      prompt_type: "content" | "type_id"
      social_platform: "facebook"
      template_type: "transactional" | "campaign"
      user_role: "Admin" | "Business" | "Customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
