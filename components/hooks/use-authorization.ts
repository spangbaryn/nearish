import { useAuth } from "@/lib/auth-context"
import { UserRole, canAccess } from "@/lib/roles"

export function useAuthorization() {
  const { user } = useAuth()
  
  // Get user's role from metadata or default to 'user'
  const userRole = (user?.user_metadata?.role as UserRole) ?? 'user'

  return {
    userRole,
    // Check if user can access based on required roles
    checkAccess: (requiredRoles: UserRole[]) => canAccess(userRole, requiredRoles),
  }
} 