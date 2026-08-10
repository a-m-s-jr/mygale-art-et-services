import { cache } from 'react'
import prisma from '@/lib/prisma'

const settingsInclude = {
  logo: { select: { url: true } },
  favicon: { select: { url: true } },
  defaultOgImage: { select: { url: true } },
} as const

export type SiteSettingsResult = Awaited<ReturnType<typeof fetchSettings>>

/**
 * Mirrors today's hardcoded Footer.tsx / HomeClient.tsx values so an unseeded
 * environment (e.g. a fresh preview DB) degrades to the pre-CMS content
 * instead of rendering blank/broken. Remove once Phase 1 has run stably.
 */
export const FALLBACK_SETTINGS = {
  id: 'singleton',
  companyNameFr: 'MYGALE ART ET SERVICES',
  companyNameEn: 'MYGALE ART & SERVICES',
  taglineFr: null as string | null,
  taglineEn: null as string | null,
  addressFr: 'Yaoundé, Cameroun',
  addressEn: 'Yaoundé, Cameroon',
  city: 'Yaoundé',
  country: 'Cameroon',
  phonePrimary: null as string | null,
  phoneSecondary: null as string | null,
  whatsapp: '+237675003269',
  emailPrimary: 'mygaleartetservices@gmail.com',
  emailContact: 'mygaleartetservices@gmail.com',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.0515640715926!2d11.4931364!3d3.7989195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bd11b473e59f7%3A0x4ce5c73b687f7408!2sMygale%20Art%20et%20Services!5e0!3m2!1sen!2scm!4v1764379907631!5m2!1sen!2scm',
  mapPlaceUrl:
    'https://www.google.com/maps/place/Mygale+Art+et+Services/@3.7989195,11.4931364,17z/data=!3m1!4b1!4m6!3m5!1s0x108bd11b473e59f7:0x4ce5c73b687f7408!8m2!3d3.7989195!4d11.4931364!16s%2Fg%2F11mrrj1_wr?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D',
  latitude: 3.7989195,
  longitude: 11.4931364,
  businessHoursFr: null as string | null,
  businessHoursEn: null as string | null,
  logoId: null as string | null,
  logo: null as { url: string } | null,
  faviconId: null as string | null,
  favicon: null as { url: string } | null,
  defaultSeoTitleFr: 'Mygale Art & Services – Architecture, Stylisme, Vitraux, Imprimerie',
  defaultSeoTitleEn: 'Mygale Art & Services – Architecture, Fashion, Stained Glass, Printing',
  defaultSeoDescriptionFr:
    'Agence basée à Yaoundé spécialisée en architecture, stylisme, vitreries et impression textile.',
  defaultSeoDescriptionEn:
    'Yaoundé-based agency specialized in architecture, fashion design, stained glass and textile printing.',
  defaultOgImageId: null as string | null,
  defaultOgImage: null as { url: string } | null,
  googleSiteVerification: 'K-VuRffW84Xt4A_DPHJnM5x3Hs_YduHLc7U1lyYhYAo',
  analyticsId: null as string | null,
  smtpFromName: null as string | null,
  smtpFromEmail: null as string | null,
  smtpReplyTo: null as string | null,
  updatedAt: new Date(0),
  updatedById: null as string | null,
}

async function fetchSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    include: settingsInclude,
  })
  return settings ?? FALLBACK_SETTINGS
}

export const getSiteSettings = cache(fetchSettings)
