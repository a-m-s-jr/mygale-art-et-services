'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog, writeRevision } from '@/lib/revisions'

type ActionState = { error?: string }

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateNavigationItem(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const id = asString(formData.get('id'))
  const labelFr = asString(formData.get('labelFr'))
  const labelEn = asString(formData.get('labelEn'))
  const href = asString(formData.get('href'))
  const openInNewTab = formData.get('openInNewTab') === 'on'

  if (!id || !labelFr || !labelEn) {
    return { error: 'Label (FR and EN) is required.' }
  }

  const current = await prisma.navigationItem.findUnique({ where: { id } })
  if (current) {
    await writeRevision('NavigationItem', id, 'UPDATE', current, user.id)
  }

  await prisma.navigationItem.update({
    where: { id },
    data: { labelFr, labelEn, href: href || null, openInNewTab },
  })

  await writeAuditLog(
    'navigation_item.update',
    { entityType: 'NavigationItem', entityId: id },
    user.id,
  )

  revalidatePath('/', 'layout')
  redirect('/admin/navigation')
}

export async function toggleNavigationItemVisibility(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  const value = asString(formData.get('visible'))
  if (!id) return

  await prisma.navigationItem.update({
    where: { id },
    data: { visible: value === 'true' },
  })

  await writeAuditLog(
    'navigation_item.toggle_visibility',
    { entityType: 'NavigationItem', entityId: id },
    user.id,
  )

  revalidatePath('/', 'layout')
  redirect('/admin/navigation')
}

export async function bulkReorderNavigationItems(orderedIds: string[]) {
  await requireRole('ADMIN')

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.navigationItem.update({ where: { id }, data: { order: index } }),
    ),
  )

  revalidatePath('/', 'layout')
}
