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