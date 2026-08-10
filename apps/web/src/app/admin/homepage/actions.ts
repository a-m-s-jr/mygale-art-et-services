'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { attachUploadedMedia } from '@/lib/queries/media'
import { writeAuditLog, writeRevision } from '@/lib/revisions'

type ActionState = { error?: string }

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateHomepageSection(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('EDITOR')

  const id = asString(formData.get('id'))
  if (!id) return { error: 'Missing section id.' }

  const current = await prisma.homepageSection.findUnique({ where: { id } })
  if (!current) return { error: 'Section not found.' }

  await writeRevision('HomepageSection', id, 'UPDATE', current, user.id)

  const titleFr = asString(formData.get('titleFr'))
  const titleEn = asString(formData.get('titleEn'))
  const subtitleFr = asString(formData.get('subtitleFr'))
  const subtitleEn = asString(formData.get('subtitleEn'))
  const bodyFr = asString(formData.get('bodyFr'))
  const bodyEn = asString(formData.get('bodyEn'))
  const ctaLabelFr = asString(formData.get('ctaLabelFr'))
  const ctaLabelEn = asString(formData.get('ctaLabelEn'))
  const ctaHref = asString(formData.get('ctaHref'))
  const mediaKey = asString(formData.get('mediaKey'))
  const mediaUrl = asString(formData.get('mediaUrl'))

  let mediaId: string | undefined
  if (mediaKey && mediaUrl) {
    const media = await attachUploadedMedia({ key: mediaKey, url: mediaUrl, folder: 'homepage' })
    mediaId = media.id
  }

  await prisma.homepageSection.update({
    where: { id },
    data: {
      titleFr: titleFr || null,
      titleEn: titleEn || null,
      subtitleFr: subtitleFr || null,
      subtitleEn: subtitleEn || null,
      bodyFr: bodyFr || null,
      bodyEn: bodyEn || null,
      ctaLabelFr: ctaLabelFr || null,
      ctaLabelEn: ctaLabelEn || null,
      ctaHref: ctaHref || null,
      ...(mediaId ? { mediaId } : {}),
    },
  })

  await writeAuditLog(
    'homepage_section.update',
    { entityType: 'HomepageSection', entityId: id },
    user.id,
  )

  revalidatePath('/')
  redirect('/admin/homepage')
}

export async function toggleHomepageSectionVisibility(formData: FormData) {
  const user = await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  const value = asString(formData.get('visible'))
  if (!id) return

  await prisma.homepageSection.update({
    where: { id },
    data: { visible: value === 'true' },
  })

  await writeAuditLog(
    'homepage_section.toggle_visibility',
    { entityType: 'HomepageSection', entityId: id },
    user.id,
  )

  revalidatePath('/')
  redirect('/admin/homepage')
}

export async function bulkReorderHomepageSections(orderedIds: string[]) {
  await requireRole('EDITOR')

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.homepageSection.update({ where: { id }, data: { order: index } }),
    ),
  )

  revalidatePath('/')
}
