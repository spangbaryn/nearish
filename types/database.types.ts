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
          business_role: BusinessRole | null;
          business_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          business_role?: BusinessRole | null;
          business_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          business_role?: BusinessRole | null;
          business_id?: string | null;
          updated_at?: string | null;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          owner_id?: string;
          updated_at?: string | null;
        };
      };
    };
  };
}
