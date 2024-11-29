export type UserRole = 'admin' | 'business' | 'customer'

export type BusinessRole = 'owner' | 'staff'

export interface User {
  id: string
  email: string
  role: UserRole
  businessRole?: BusinessRole
  businessId?: string
  metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: User | null
  loading: boolean
  error?: Error | null
} 