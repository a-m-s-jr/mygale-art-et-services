'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog } from '@/lib/revisions'
import type { Role } from '@prisma/client'

type ActionState = { error?: string }

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

// Only a SUPER_ADMIN can grant SUPER_ADMIN or ADMIN — an ADMIN can only manage EDITOR and below.
function canAssignRole(actorRole: Role, targetRole: Role) {
  if (targetRole === 'SUPER_ADMIN' || targetRole === 'ADMIN') {
    return actorRole === 'SUPER_ADMIN'
  }
  return true
}

async function isLastActiveAdmin(userId: string) {
  const count = await prisma.user.count({
    where: {
      id: { not: userId },
      active: true,
      role: { in: ['SUPER_ADMIN', 'ADMIN'] },
    },
  })
  return count === 0
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function createUser(_prevState: ActionState, formData: FormData) {
  const actor = await requireRole('ADMIN')

  const name = asString(formData.get('name'))
  const email = asString(formData.get('email')).toLowerCase()
  const password = asString(formData.get('password'))
  const role = asString(formData.get('role')) as Role

  if (!name || !email || !password || !role) {
    return { error: 'Name, email, password, and role are required.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (!actor.role || !canAssignRole(actor.role, role)) {
    return { error: 'Only a Super Admin can grant Admin or Super Admin roles.' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'A user with that email already exists.' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, active: true },
  })

  await writeAuditLog('user.create', { entityType: 'User', entityId: user.id, role }, actor.id)

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function updateUser(_prevState: ActionState, formData: FormData) {
  const actor = await requireRole('ADMIN')

  const id = asString(formData.get('id'))
  const name = asString(formData.get('name'))
  const role = asString(formData.get('role')) as Role
  const password = asString(formData.get('password'))
  const active = formData.get('active') === 'on'

  if (!id || !name || !role) {
    return { error: 'Name and role are required.' }
  }
  if (!actor.role || !canAssignRole(actor.role, role)) {
    return { error: 'Only a Super Admin can grant Admin or Super Admin roles.' }
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return { error: 'User not found.' }
  }

  const isSelf = target.id === actor.id
  if (isSelf && (role !== target.role || !active)) {
    return { error: "You can't change your own role or deactivate your own account." }
  }

  if ((!active || ROLE_RANK[role] < ROLE_RANK.ADMIN) && (await isLastActiveAdmin(id))) {
    return { error: 'At least one active Admin or Super Admin must remain.' }
  }

  if (password && password.length > 0 && password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const data: { name: string; role: Role; active: boolean; passwordHash?: string } = {
    name,
    role,
    active,
  }
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({ where: { id }, data })

  if (!active) {
    // Deactivation revokes any currently-active sessions immediately.
    await prisma.session.deleteMany({ where: { userId: id } })
  }

  await writeAuditLog('user.update', { entityType: 'User', entityId: id, role, active }, actor.id)

  revalidatePath('/admin/users')
  redirect('/admin/users')
}
