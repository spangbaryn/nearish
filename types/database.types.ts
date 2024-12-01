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
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          email?: string;
          role?: UserRole;
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
    };
  };
}
