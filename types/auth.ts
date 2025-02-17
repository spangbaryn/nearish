export type UserRole = 'admin' | 'business' | 'customer'

export type BusinessRole = 'owner' | 'staff'

export interface BusinessMembership {
  businessId: string
  businessName: string
  role: BusinessRole
}

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  avatar_url?: string
  metadata?: {
    name?: string
    avatar_url?: string
  }
  businesses?: BusinessMembership[]
}

export interface AuthState {
  user: User | null
  loading: boolean
  error?: Error | null
}

export interface TeamMember {
  id: string;
  role: BusinessRole;
  profile: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
} 