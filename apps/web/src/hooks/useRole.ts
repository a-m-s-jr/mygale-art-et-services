'use client'

import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'

/**
 * Client-side hook to check if current user is admin
 * WARNING: This is for UI purposes only - NOT for security!
 * Always verify admin status on the server for protected operations
 */
export function useIsAdmin() {
  const { data: session, status } = useSession()
  
  return {
    isAdmin: session?.user?.role === Role.ADMIN,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  }
}

/**
 * Client-side hook to check if current user has a specific role
 * WARNING: This is for UI purposes only - NOT for security!
 */
export function useHasRole(role: Role) {
  const { data: session, status } = useSession()
  
  return {
    hasRole: session?.user?.role === role,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    currentRole: session?.user?.role,
  }
}
