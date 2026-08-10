'use server'

import crypto from 'crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeAuditLog } from '@/lib/revisions'

const SESSION_TTL_DAYS = 30

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value : ''
}

function isBcryptHash(value: string) {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')
}

function safeEquals(a: string, b: string) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

type ActionState = {
  error?: string
}

export async function signInWithPassword(_prevState: ActionState, formData: FormData) {
  const email = normalizeEmail(formData.get('email'))
  const password = asString(formData.get('password'))

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (
    !user ||
    !user.role ||
    ROLE_RANK[user.role] < ROLE_RANK.EDITOR ||
    !user.passwordHash ||
    !user.active
  ) {
    return { error: 'Invalid credentials.' }
  }

  let validPassword = false
  if (isBcryptHash(user.passwordHash)) {
    try {
      validPassword = await bcrypt.compare(password, user.passwordHash)
    } catch {
      validPassword = false
    }
  } else {
    validPassword = safeEquals(user.passwordHash, password)
  }

  if (!validPassword) {
    return { error: 'Invalid credentials.' }
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const token = crypto.randomBytes(32).toString('hex')
  const sessionId = crypto.randomUUID()

  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0]?.trim() : null
  const userAgent = headerStore.get('user-agent')

  await prisma.session.create({
    data: {
      id: sessionId,
      token,
      userId: user.id,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress,
      userAgent,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set('authjs.session-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })

  await writeAuditLog('auth.login', { entityType: 'User', entityId: user.id }, user.id)

  redirect('/admin')
}

export async function signOut() {
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  const token = cookieStore.get('authjs.session-token')?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  cookieStore.delete('authjs.session-token')

  if (user) {
    await writeAuditLog('auth.logout', { entityType: 'User', entityId: user.id }, user.id)
  }

  redirect('/login')
}
