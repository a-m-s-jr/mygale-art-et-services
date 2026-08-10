'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog } from '@/lib/revisions'

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function deleteMediaItem(formData: FormData) {
  const user = await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.media.update({ where: { id }, data: { deletedAt: new Date() } })

  await writeAuditLog('media.delete', { entityType: 'Media', entityId: id }, user.id)

  revalidatePath('/admin/media')
}

export async function restoreMediaItem(formData: FormData) {
  const user = await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.media.update({ where: { id }, data: { deletedAt: null } })

  await writeAuditLog('media.restore', { entityType: 'Media', entityId: id }, user.id)

  revalidatePath('/admin/media')
}
