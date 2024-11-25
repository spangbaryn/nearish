export type UserRole = 'user' | 'admin' | 'business'

export const ROLES = {
  USER: 'user' as UserRole,
  ADMIN: 'admin' as UserRole,
  BUSINESS: 'business' as UserRole,
}

// Role hierarchy - higher roles include permissions of lower roles
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  user: ['user'],
  business: ['user', 'business'],
  admin: ['user', 'business', 'admin'],
}

// Check if a user has a required role
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false
}

// Check if component/route should be accessible
export function canAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasRequiredRole(userRole, role))
} 