import { User } from '@/types/api'
import { UserRole } from '@/lib/roles'

export interface UserTableProps {
  users: User[]
}

export interface UserRowProps {
  user: User & {
    user_metadata?: {
      role?: UserRole
    }
  }
}

export interface UserActionsProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}
