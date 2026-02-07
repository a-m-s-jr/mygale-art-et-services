import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import type { User } from '@prisma/client'

const SESSION_COOKIE_NAMES = [
  '__Secure-authjs.session-token',
  'authjs.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  'session-token',
  'session',
]

async function getSessionToken() {
  const jar = await cookies()
  for (const name of SESSION_COOKIE_NAMES) {
    const value = jar.get(name)?.value
    if (value) return value
  }
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session?.user) return null
  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }
  return session.user
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }
  return user
}
