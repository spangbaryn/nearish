import { useAuth } from "@/lib/auth-context"
import { UserRole, canAccess } from "@/lib/roles"

export function useAuthorization() {
  const { user } = useAuth()
  
  // Get user's role from either metadata location or default to 'user'
  const userRole = (
    user?.user_metadata?.role || 
    user?.raw_user_meta_data?.role || 
    'user'
  ) as UserRole

  return {
    userRole,
    // Check if user can access based on required roles
    checkAccess: (requiredRoles: UserRole[]) => canAccess(userRole, requiredRoles),
  }
} 