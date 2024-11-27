// components/features/users/utils.ts
import { User } from '@/types/api'
import { UserRole } from '@/lib/roles'

export function getUserRole(user: User): UserRole | undefined {
  return user.user_metadata?.role
}