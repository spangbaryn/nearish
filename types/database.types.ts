export type UserRole = 'Customer' | 'Business' | 'Admin';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string | null;
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
      };
      business_roles: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: 'Owner' | 'Staff';
          created_at: string;
        };
      };
    };
  };
}
