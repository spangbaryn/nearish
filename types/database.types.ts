export type UserRole = 'admin' | 'business' | 'customer';
export type BusinessRole = 'owner' | 'staff';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          zip_code: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          zip_code?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          email?: string;
          role?: UserRole;
          zip_code?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string | null;
        };
      };
      business_members: {
        Row: {
          id: string;
          profile_id: string;
          business_id: string;
          role: BusinessRole;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          profile_id: string;
          business_id: string;
          role: BusinessRole;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          role?: BusinessRole;
          updated_at?: string | null;
        };
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content: string;
          type: 'transactional' | 'campaign';
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          subject: string;
          content: string;
          type: 'transactional' | 'campaign';
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          subject?: string;
          content?: string;
          type?: 'transactional' | 'campaign';
          updated_at?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          collection_id: string;
          template_id: string;
          sent_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          collection_id: string;
          template_id: string;
          sent_at?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          collection_id?: string;
          template_id?: string;
          sent_at?: string;
          updated_at?: string | null;
        };
      };
      collections: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          business_id: string;
          source: 'facebook' | 'admin' | 'platform';
          content: string;
          final_content: string | null;
          final_type: 'Promotion' | 'Event' | 'Update' | null;
          ai_generated_type: string | null;
          included: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          business_id: string;
          source: 'facebook' | 'admin' | 'platform';
          content: string;
          final_content?: string | null;
          final_type?: 'Promotion' | 'Event' | 'Update' | null;
          ai_generated_type?: string | null;
          included?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          business_id?: string;
          source?: 'facebook' | 'admin' | 'platform';
          content?: string;
          final_content?: string | null;
          final_type?: 'Promotion' | 'Event' | 'Update' | null;
          ai_generated_type?: string | null;
          included?: boolean;
          updated_at?: string | null;
        };
      };
      posts_collections: {
        Row: {
          id: string;
          post_id: string;
          collection_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          collection_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          collection_id?: string;
          created_at?: string;
        };
      };
      email_lists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string | null;
        };
      };
      profile_list_subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          list_id: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          profile_id: string;
          list_id: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          unsubscribed_at?: string | null;
        };
      };
      zip_codes: {
        Row: {
          id: string;
          code: string;
          city: string;
          state: string;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          city: string;
          state: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          city?: string;
          state?: string;
          is_active?: boolean;
          updated_at?: string | null;
        };
      };
    };
  };
}
