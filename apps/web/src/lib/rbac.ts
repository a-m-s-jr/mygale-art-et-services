import { Role } from '@prisma/client'
import { Session } from 'next-auth'

/**
 * Check if a user has admin role
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === Role.ADMIN
}

/**
 * Check if a user has a specific role
 */
export function hasRole(session: Session | null, role: Role): boolean {
  return session?.user?.role === role
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user
}

/**
 * Get user role or return default USER role
 */
export function getUserRole(session: Session | null): Role {
  return session?.user?.role || Role.USER
}
