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

function asFloat(value: FormDataEntryValue | null) {
  const str = asString(value)
  if (!str) return null
  const num = Number(str)
  return Number.isFinite(num) ? num : null
}

async function attachIfUploaded(keyField: string, urlField: string, formData: FormData, folder: string) {
  const key = asString(formData.get(keyField))
  const url = asString(formData.get(urlField))
  if (!key || !url) return undefined
  const media = await attachUploadedMedia({ key, url, folder })
  return media.id
}

export async function updateSiteSettings(_prevState: ActionState, formData: FormData) {
  const user = await requireRole('ADMIN')

  const current = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (current) {
    await writeRevision('SiteSettings', 'singleton', 'UPDATE', current, user.id)
  }

  const companyNameFr = asString(formData.get('companyNameFr'))
  const companyNameEn = asString(formData.get('companyNameEn'))
  if (!companyNameFr || !companyNameEn) {
    return { error: 'Company name (FR and EN) is required.' }
  }

  const logoId = await attachIfUploaded('logoKey', 'logoUrl', formData, 'site')
  const faviconId = await attachIfUploaded('faviconKey', 'faviconUrl', formData, 'site')
  const defaultOgImageId = await attachIfUploaded('ogImageKey', 'ogImageUrl', formData, 'site')

  const data = {
    companyNameFr,
    companyNameEn,
    taglineFr: asString(formData.get('taglineFr')) || null,
    taglineEn: asString(formData.get('taglineEn')) || null,
    addressFr: asString(formData.get('addressFr')) || null,
    addressEn: asString(formData.get('addressEn')) || null,
    city: asString(formData.get('city')) || null,
    country: asString(formData.get('country')) || null,
    phonePrimary: asString(formData.get('phonePrimary')) || null,
    phoneSecondary: asString(formData.get('phoneSecondary')) || null,
    whatsapp: asString(formData.get('whatsapp')) || null,
    emailPrimary: asString(formData.get('emailPrimary')) || null,
    emailContact: asString(formData.get('emailContact')) || null,
    mapEmbedUrl: asString(formData.get('mapEmbedUrl')) || null,
    mapPlaceUrl: asString(formData.get('mapPlaceUrl')) || null,
    latitude: asFloat(formData.get('latitude')),
    longitude: asFloat(formData.get('longitude')),
    businessHoursFr: asString(formData.get('businessHoursFr')) || null,
    businessHoursEn: asString(formData.get('businessHoursEn')) || null,
    defaultSeoTitleFr: asString(formData.get('defaultSeoTitleFr')) || null,
    defaultSeoTitleEn: asString(formData.get('defaultSeoTitleEn')) || null,
    defaultSeoDescriptionFr: asString(formData.get('defaultSeoDescriptionFr')) || null,
    defaultSeoDescriptionEn: asString(formData.get('defaultSeoDescriptionEn')) || null,
    googleSiteVerification: asString(formData.get('googleSiteVerification')) || null,
    analyticsId: asString(formData.get('analyticsId')) || null,
    smtpFromName: asString(formData.get('smtpFromName')) || null,
    smtpFromEmail: asString(formData.get('smtpFromEmail')) || null,
    smtpReplyTo: asString(formData.get('smtpReplyTo')) || null,
    updatedById: user.id,
    ...(logoId ? { logoId } : {}),
    ...(faviconId ? { faviconId } : {}),
    ...(defaultOgImageId ? { defaultOgImageId } : {}),
  }

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  await writeAuditLog(
    'site_settings.update',
    { entityType: 'SiteSettings', entityId: 'singleton' },
    user.id,
  )

  // Settings affect Navbar/Footer/root metadata on every route.
  revalidatePath('/', 'layout')
  redirect('/admin/settings')
}
