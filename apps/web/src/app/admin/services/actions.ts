'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { attachUploadedMedia } from '@/lib/queries/media'
import { writeAuditLog, writeRevision } from '@/lib/revisions'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import type { BlockType } from '@prisma/client'

type ActionState = { error?: string }

type SectionInput = {
  key: string
  type: BlockType
  titleFr: string
  titleEn: string
  itemsFr: string[]
  itemsEn: string[]
  bodyFr: string
  bodyEn: string
  mediaKey: string
  mediaUrl: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true })
}

function parseSections(raw: string): SectionInput[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function snapshotService(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: { sections: true },
  })
}

async function syncSections(serviceId: string, sections: SectionInput[]) {
  const keep = sections.map((s) => s.key)

  await prisma.serviceSection.deleteMany({
    where: { serviceId, key: { notIn: keep.length ? keep : ['__none__'] } },
  })

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]
    let mediaId: string | undefined
    if (s.mediaKey && s.mediaUrl) {
      const media = await attachUploadedMedia({
        key: s.mediaKey,
        url: s.mediaUrl,
        folder: `services/${serviceId}/blocks`,
      })
      mediaId = media.id
    }

    const data = {
      type: s.type,
      titleFr: s.titleFr,
      titleEn: s.titleEn,
      itemsFr: s.itemsFr,
      itemsEn: s.itemsEn,
      bodyFr: s.type === 'RICHTEXT' && s.bodyFr ? sanitizeHtml(s.bodyFr) : null,
      bodyEn: s.type === 'RICHTEXT' && s.bodyEn ? sanitizeHtml(s.bodyEn) : null,
      order: i,
      ...(mediaId ? { mediaId } : {}),
    }

    await prisma.serviceSection.upsert({
      where: { serviceId_key: { serviceId, key: s.key } },
      update: data,
      create: { serviceId, key: s.key, ...data },
    })
  }
}

export async function createService(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('EDITOR')

  const titleFr = asString(formData.get('titleFr'))
  const titleEn = asString(formData.get('titleEn'))
  const summaryFr = asString(formData.get('summaryFr'))
  const summaryEn = asString(formData.get('summaryEn'))
  const rawSlug = asString(formData.get('slug')) || titleEn || titleFr
  const slug = normalizeSlug(rawSlug)
  const seoTitleFr = asString(formData.get('seoTitleFr'))
  const seoTitleEn = asString(formData.get('seoTitleEn'))
  const seoDescriptionFr = asString(formData.get('seoDescriptionFr'))
  const seoDescriptionEn = asString(formData.get('seoDescriptionEn'))
  const order = Number(asString(formData.get('order'))) || 0
  const featured = formData.get('featured') === 'on'
  const published = formData.get('published') === 'on'
  const heroImageKey = asString(formData.get('heroImageKey'))
  const heroImageUrl = asString(formData.get('heroImageUrl'))
  const sections = parseSections(asString(formData.get('sectionsJson')) || '[]')

  if (!titleFr || !titleEn || !summaryFr || !summaryEn || !slug) {
    return { error: 'Please fill in all required fields (FR and EN).' }
  }

  const existing = await prisma.service.findUnique({ where: { slug } })
  if (existing) {
    return { error: 'Slug already exists. Please choose another.' }
  }

  let heroImageId: string | undefined
  if (heroImageKey && heroImageUrl) {
    const media = await attachUploadedMedia({ key: heroImageKey, url: heroImageUrl, folder: 'services' })
    heroImageId = media.id
  }

  const service = await prisma.service.create({
    data: {
      slug,
      titleFr,
      titleEn,
      summaryFr,
      summaryEn,
      heroImageId,
      seoTitleFr: seoTitleFr || null,
      seoTitleEn: seoTitleEn || null,
      seoDescriptionFr: seoDescriptionFr || null,
      seoDescriptionEn: seoDescriptionEn || null,
      order,
      featured,
      published,
      createdById: user.id,
      updatedById: user.id,
    },
  })

  await syncSections(service.id, sections)

  const snapshot = await snapshotService(service.id)
  await writeRevision('Service', service.id, 'CREATE', snapshot, user.id)
  await writeAuditLog('service.create', { entityType: 'Service', entityId: service.id }, user.id)

  revalidatePath('/services')
  revalidatePath(`/services/${service.slug}`)
  revalidatePath('/')
  redirect('/admin/services')
}

export async function updateService(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('EDITOR')

  const id = asString(formData.get('id'))
  const titleFr = asString(formData.get('titleFr'))
  const titleEn = asString(formData.get('titleEn'))
  const summaryFr = asString(formData.get('summaryFr'))
  const summaryEn = asString(formData.get('summaryEn'))
  const rawSlug = asString(formData.get('slug')) || titleEn || titleFr
  const slug = normalizeSlug(rawSlug)
  const seoTitleFr = asString(formData.get('seoTitleFr'))
  const seoTitleEn = asString(formData.get('seoTitleEn'))
  const seoDescriptionFr = asString(formData.get('seoDescriptionFr'))
  const seoDescriptionEn = asString(formData.get('seoDescriptionEn'))
  const order = Number(asString(formData.get('order'))) || 0
  const featured = formData.get('featured') === 'on'
  const published = formData.get('published') === 'on'
  const heroImageKey = asString(formData.get('heroImageKey'))
  const heroImageUrl = asString(formData.get('heroImageUrl'))
  const sections = parseSections(asString(formData.get('sectionsJson')) || '[]')

  if (!id || !titleFr || !titleEn || !summaryFr || !summaryEn || !slug) {
    return { error: 'Please fill in all required fields (FR and EN).' }
  }

  const current = await prisma.service.findUnique({ where: { id } })
  if (!current) {
    return { error: 'Service not found.' }
  }

  const existing = await prisma.service.findUnique({ where: { slug } })
  if (existing && existing.id !== id) {
    return { error: 'Slug already exists. Please choose another.' }
  }

  // Snapshot BEFORE mutating — the revision represents the state being replaced.
  const before = await snapshotService(id)
  await writeRevision('Service', id, 'UPDATE', before, user.id)

  let heroImageId: string | null | undefined = current.heroImageId
  if (heroImageKey && heroImageUrl) {
    const media = await attachUploadedMedia({ key: heroImageKey, url: heroImageUrl, folder: 'services' })
    heroImageId = media.id
  }

  const previousSlug = current.slug

  await prisma.service.update({
    where: { id },
    data: {
      slug,
      titleFr,
      titleEn,
      summaryFr,
      summaryEn,
      heroImageId,
      seoTitleFr: seoTitleFr || null,
      seoTitleEn: seoTitleEn || null,
      seoDescriptionFr: seoDescriptionFr || null,
      seoDescriptionEn: seoDescriptionEn || null,
      order,
      featured,
      published,
      updatedById: user.id,
    },
  })

  await syncSections(id, sections)

  // Slug changed: preserve the old URL with a redirect so existing links never break.
  if (previousSlug !== slug) {
    const fromPath = `/services/${previousSlug}`
    await prisma.redirect.upsert({
      where: { fromPath },
      update: { toPath: `/services/${slug}`, active: true },
      create: { fromPath, toPath: `/services/${slug}`, statusCode: 308, active: true },
    })
  }

  await writeAuditLog('service.update', { entityType: 'Service', entityId: id }, user.id)

  revalidatePath('/services')
  revalidatePath(`/services/${previousSlug}`)
  if (previousSlug !== slug) revalidatePath(`/services/${slug}`)
  revalidatePath('/')
  redirect('/admin/services')
}

export async function softDeleteService(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  if (!id) return

  const service = await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: user.id },
  })

  await writeAuditLog('service.soft_delete', { entityType: 'Service', entityId: id }, user.id)

  revalidatePath('/services')
  revalidatePath(`/services/${service.slug}`)
  revalidatePath('/')
  redirect('/admin/services')
}

export async function restoreService(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  if (!id) return

  const service = await prisma.service.update({
    where: { id },
    data: { deletedAt: null, updatedById: user.id },
  })

  await writeAuditLog('service.restore', { entityType: 'Service', entityId: id }, user.id)

  revalidatePath('/services')
  revalidatePath(`/services/${service.slug}`)
  revalidatePath('/')
  redirect('/admin/services')
}

export async function toggleServicePublish(formData: FormData) {
  const user = await requireRole('ADMIN')
  const id = asString(formData.get('id'))
  const value = asString(formData.get('published'))
  if (!id) return

  const published = value === 'true'
  const service = await prisma.service.update({
    where: { id },
    data: { published, updatedById: user.id },
  })

  await writeAuditLog(
    published ? 'service.publish' : 'service.unpublish',
    { entityType: 'Service', entityId: id },
    user.id,
  )

  revalidatePath('/services')
  revalidatePath(`/services/${service.slug}`)
  revalidatePath('/')
  redirect('/admin/services')
}

export async function bulkReorderServices(orderedIds: string[]) {
  await requireRole('EDITOR')

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.service.update({ where: { id }, data: { order: index } })),
  )

  revalidatePath('/services')
  revalidatePath('/')
}

export async function restoreServiceRevision(formData: FormData) {
  const user = await requireRole('ADMIN')
  const revisionId = asString(formData.get('revisionId'))
  const serviceId = asString(formData.get('serviceId'))
  if (!revisionId || !serviceId) return

  const revision = await prisma.revision.findUnique({ where: { id: revisionId } })
  if (!revision || revision.entityType !== 'Service' || revision.entityId !== serviceId) return

  // Snapshot current state first so this restore is itself undoable.
  const before = await snapshotService(serviceId)
  if (before) {
    await writeRevision('Service', serviceId, 'UPDATE', before, user.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snap = revision.snapshot as any
  if (!snap?.service) return

  const s = snap.service
  await prisma.service.update({
    where: { id: serviceId },
    data: {
      slug: s.slug,
      titleFr: s.titleFr,
      titleEn: s.titleEn,
      summaryFr: s.summaryFr,
      summaryEn: s.summaryEn,
      heroImageId: s.heroImageId,
      ogImageId: s.ogImageId,
      seoTitleFr: s.seoTitleFr,
      seoTitleEn: s.seoTitleEn,
      seoDescriptionFr: s.seoDescriptionFr,
      seoDescriptionEn: s.seoDescriptionEn,
      order: s.order,
      featured: s.featured,
      published: s.published,
      updatedById: user.id,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keep = (snap.sections || []).map((sec: any) => sec.key)
  await prisma.serviceSection.deleteMany({
    where: { serviceId, key: { notIn: keep.length ? keep : ['__none__'] } },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const sec of snap.sections || ([] as any[])) {
    const data = {
      type: sec.type,
      titleFr: sec.titleFr,
      titleEn: sec.titleEn,
      itemsFr: sec.itemsFr || [],
      itemsEn: sec.itemsEn || [],
      bodyFr: sec.bodyFr,
      bodyEn: sec.bodyEn,
      mediaId: sec.mediaId,
      order: sec.order,
    }
    await prisma.serviceSection.upsert({
      where: { serviceId_key: { serviceId, key: sec.key } },
      update: data,
      create: { serviceId, key: sec.key, ...data },
    })
  }

  await writeAuditLog(
    'service.restore_revision',
    { entityType: 'Service', entityId: serviceId, revisionId },
    user.id,
  )

  revalidatePath('/services')
  revalidatePath(`/services/${s.slug}`)
  revalidatePath('/')
  redirect(`/admin/services/${serviceId}/edit`)
}
