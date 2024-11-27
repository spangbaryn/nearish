import { UserRole } from "@/lib/roles"

// Base API response type
export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  status?: number
}

// API error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  status: number
}

// User-related types
export interface User {
  id: string
  email: string | null
  created_at: string
  user_metadata: {
    role?: UserRole
  }
  raw_user_meta_data?: {
    role?: UserRole
  }
}

// Users API specific types
export interface UsersResponse extends ApiResponse {
  users?: User[]
}

// Error codes
export const API_ERROR_CODES = {
  AUTHENTICATION: 'auth_error',
  AUTHORIZATION: 'authorization_error',
  VALIDATION: 'validation_error',
  NOT_FOUND: 'not_found',
  SERVER_ERROR: 'server_error'
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES] 