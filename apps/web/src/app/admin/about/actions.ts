'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { attachUploadedMedia } from '@/lib/queries/media'
import { writeAuditLog, writeRevision } from '@/lib/revisions'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

type ActionState = { error?: string }

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateAboutPage(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('EDITOR')

  const current = await prisma.aboutPage.findUnique({ where: { id: 'singleton' } })
  if (current) {
    await writeRevision('AboutPage', 'singleton', 'UPDATE', current, user.id)
  }

  const titleFr = asString(formData.get('titleFr'))
  const titleEn = asString(formData.get('titleEn'))
  const introFr = asString(formData.get('introFr'))
  const introEn = asString(formData.get('introEn'))
  const bodyFr = asString(formData.get('bodyFr'))
  const bodyEn = asString(formData.get('bodyEn'))

  if (!titleFr || !titleEn || !introFr || !introEn || !bodyFr || !bodyEn) {
    return { error: 'Title, intro, and body are required in both FR and EN.' }
  }

  const heroImageKey = asString(formData.get('heroImageKey'))
  const heroImageUrl = asString(formData.get('heroImageUrl'))
  let heroImageId: string | undefined
  if (heroImageKey && heroImageUrl) {
    const media = await attachUploadedMedia({ key: heroImageKey, url: heroImageUrl, folder: 'about' })
    heroImageId = media.id
  }

  const data = {
    titleFr,
    titleEn,
    introFr,
    introEn,
    bodyFr: sanitizeHtml(bodyFr),
    bodyEn: sanitizeHtml(bodyEn),
    seoTitleFr: asString(formData.get('seoTitleFr')) || null,
    seoTitleEn: asString(formData.get('seoTitleEn')) || null,
    seoDescriptionFr: asString(formData.get('seoDescriptionFr')) || null,
    seoDescriptionEn: asString(formData.get('seoDescriptionEn')) || null,
    updatedById: user.id,
    ...(heroImageId ? { heroImageId } : {}),
  }

  await prisma.aboutPage.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  await writeAuditLog('about_page.update', { entityType: 'AboutPage', entityId: 'singleton' }, user.id)

  revalidatePath('/about')
  redirect('/admin/about')
}
