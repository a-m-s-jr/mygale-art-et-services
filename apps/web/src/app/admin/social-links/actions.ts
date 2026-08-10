'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog, writeRevision } from '@/lib/revisions'
import type { SocialPlatform } from '@prisma/client'

type ActionState = { error?: string }

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function createSocialLink(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const platform = asString(formData.get('platform')) as SocialPlatform
  const label = asString(formData.get('label'))
  const url = asString(formData.get('url'))
  const visible = formData.get('visible') === 'on'

  if (!platform || !url) {
    return { error: 'Platform and URL are required.' }
  }

  const count = await prisma.socialLink.count({ where: { deletedAt: null } })

  const link = await prisma.socialLink.create({
    data: { platform, label: label || null, url, visible, order: count },
  })

  await writeAuditLog('social_link.create', { entityType: 'SocialLink', entityId: link.id }, user.id)

  revalidatePath('/', 'layout')
  redirect('/admin/social-links')
}

export async function updateSocialLink(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const id = asString(formData.get('id'))
  const platform = asString(formData.get('platform')) as SocialPlatform
  const label = asString(formData.get('label'))
  const url = asString(formData.get('url'))
  const visible = formData.get('visible') === 'on'

  if (!id || !platform || !url) {
    return { error: 'Platform and URL are required.' }
  }

  const current = await prisma.socialLink.findUnique({ where: { id } })
  if (current) {
    await writeRevision('SocialLink', id, 'UPDATE', current, user.id)
  }

  await prisma.socialLink.update({
    where: { id },
    data: { platform, label: label || null, url, visible },
  })

  await writeAuditLog('social_link.update', { entityType: 'SocialLink', entityId: id }, user.id)

  revalidatePath('/', 'layout')
  redirect('/admin/social-links')
}

export async function deleteSocialLink(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.socialLink.update({ where: { id }, data: { deletedAt: new Date() } })

  await writeAuditLog('social_link.delete', { entityType: 'SocialLink', entityId: id }, user.id)

  revalidatePath('/', 'layout')
  redirect('/admin/social-links')
}

export async function bulkReorderSocialLinks(orderedIds: string[]) {
  await requireRole('ADMIN')

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.socialLink.update({ where: { id }, data: { order: index } })),
  )

  revalidatePath('/', 'layout')
}
