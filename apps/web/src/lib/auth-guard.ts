'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { Role } from '@prisma/client'

/**
 * Verify that the current user is an admin
 * Throws an error if not authenticated or not an admin
 * Use this in Server Actions to protect admin-only operations
 */
export async function verifyAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error('Forbidden: Admin access required')
  }

  return session.user
}

/**
 * Verify that the current user is authenticated
 * Throws an error if not authenticated
 * Use this in Server Actions to protect authenticated-only operations
 */
export async function verifyAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  return session.user
}

/**
 * Get the current user or null if not authenticated
 * Safe to use in Server Actions - returns null instead of throwing
 */
export async function getAuthUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}
