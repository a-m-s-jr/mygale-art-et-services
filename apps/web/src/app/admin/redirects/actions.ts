'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog } from '@/lib/revisions'

type ActionState = { error?: string }

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizePath(value: string) {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return value.startsWith('/') ? value : `/${value}`
}

export async function createRedirect(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const fromPath = normalizePath(asString(formData.get('fromPath')))
  const toPath = normalizePath(asString(formData.get('toPath')))
  const statusCode = Number(asString(formData.get('statusCode'))) || 308
  const active = formData.get('active') === 'on'

  if (!fromPath || !toPath) {
    return { error: 'Both paths are required.' }
  }
  if (fromPath === toPath) {
    return { error: 'From and to paths cannot be the same.' }
  }

  const existing = await prisma.redirect.findUnique({ where: { fromPath } })
  if (existing) {
    return { error: 'A redirect from that path already exists.' }
  }

  const created = await prisma.redirect.create({
    data: { fromPath, toPath, statusCode, active },
  })

  await writeAuditLog('redirect.create', { entityType: 'Redirect', entityId: created.id }, user.id)

  revalidatePath('/admin/redirects')
  redirect('/admin/redirects')
}

export async function updateRedirect(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const id = asString(formData.get('id'))
  const fromPath = normalizePath(asString(formData.get('fromPath')))
  const toPath = normalizePath(asString(formData.get('toPath')))
  const statusCode = Number(asString(formData.get('statusCode'))) || 308
  const active = formData.get('active') === 'on'

  if (!id || !fromPath || !toPath) {
    return { error: 'Both paths are required.' }
  }

  const existing = await prisma.redirect.findUnique({ where: { fromPath } })
  if (existing && existing.id !== id) {
    return { error: 'A redirect from that path already exists.' }
  }

  await prisma.redirect.update({ where: { id }, data: { fromPath, toPath, statusCode, active } })

  await writeAuditLog('redirect.update', { entityType: 'Redirect', entityId: id }, user.id)

  revalidatePath('/admin/redirects')
  redirect('/admin/redirects')
}

export async function deleteRedirect(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.redirect.delete({ where: { id } })

  await writeAuditLog('redirect.delete', { entityType: 'Redirect', entityId: id }, user.id)

  revalidatePath('/admin/redirects')
}

export async function toggleRedirectActive(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  const value = asString(formData.get('active'))
  if (!id) return

  await prisma.redirect.update({ where: { id }, data: { active: value === 'true' } })

  await writeAuditLog('redirect.toggle_active', { entityType: 'Redirect', entityId: id }, user.id)

  revalidatePath('/admin/redirects')
}
