import { UserRole } from "@/lib/roles"
import { useAuthorization } from "@/components/hooks/use-authorization"

interface ProtectedProps {
  children: React.ReactNode
  requiredRoles: UserRole[]
  fallback?: React.ReactNode
}

export function Protected({ 
  children, 
  requiredRoles, 
  fallback = null 
}: ProtectedProps) {
  const { checkAccess } = useAuthorization()

  if (!checkAccess(requiredRoles)) {
    return fallback
  }

  return <>{children}</>
} 