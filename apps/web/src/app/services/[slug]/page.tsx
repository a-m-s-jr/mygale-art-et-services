import React from 'react'
import ServiceClient from './ServiceClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getServiceBySlug,
  getServiceBySlugForPreview,
  getPublishedServices,
} from '@/lib/queries/services'
import { getSiteSettings } from '@/lib/queries/settings'
import { getLocale } from '@/lib/getLocale'
import { getCurrentUser } from '@/lib/auth'
import { buildServiceJsonLd, buildBreadcrumbJsonLd, jsonLdScript } from '@/lib/jsonLd'

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

async function resolveService(slug: string, previewRequested: boolean) {
  if (!previewRequested) return { service: await getServiceBySlug(slug), isPreview: false }

  const user = await getCurrentUser()
  if (!user?.role || ROLE_RANK[user.role] < ROLE_RANK.EDITOR) {
    return { service: await getServiceBySlug(slug), isPreview: false }
  }

  return { service: await getServiceBySlugForPreview(slug), isPreview: true }
}

// Rendered per-request (like every other CMS-driven page in this app) rather
// than via generateStaticParams/ISR: the root layout reads the locale cookie,
// which conflicts with Next's on-demand-ISR-fallback rendering mode and
// throws DYNAMIC_SERVER_USAGE in production for any slug not present in the
// static param set at build time — i.e. every service page, since this was
// the one dynamic-segment route still wired up that way. See the same note
// on blog/[slug]/page.tsx, where this was already fixed.

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}): Promise<Metadata> {
  const p = await params
  const [service, locale] = await Promise.all([getServiceBySlug(p.slug), getLocale()])
  if (!service) return {}

  const title =
    (locale === 'en' ? service.seoTitleEn : service.seoTitleFr) ||
    (locale === 'en' ? service.titleEn : service.titleFr)
  const description =
    (locale === 'en' ? service.seoDescriptionEn : service.seoDescriptionFr) ||
    (locale === 'en' ? service.summaryEn : service.summaryFr)

  const baseUrl = 'https://www.mygaleartetservices.org'
  const url = `${baseUrl}/services/${service.slug}`
  const ogImage = service.ogImage?.url || service.heroImage?.url || `${baseUrl}/hero-bg.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MYGALE Art & Services',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: { slug: string } | Promise<{ slug: string }>
  searchParams: { preview?: string } | Promise<{ preview?: string }>
}) {
  const p = await params
  const sp = await searchParams
  const [{ service, isPreview }, locale, allServices, settings] = await Promise.all([
    resolveService(p.slug, sp.preview === '1'),
    getLocale(),
    getPublishedServices(),
    getSiteSettings(),
  ])

  if (!service) {
    notFound()
  }

  const baseUrl = 'https://www.mygaleartetservices.org'
  const title = locale === 'en' ? service.titleEn : service.titleFr
  const description = locale === 'en' ? service.summaryEn : service.summaryFr
  const servicesLabel = locale === 'en' ? 'Services' : 'Nos services'

  const serviceJsonLd = buildServiceJsonLd({
    name: title,
    description,
    slug: service.slug,
    imageUrl: service.heroImage?.url,
    providerName: settings.companyNameFr,
  })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === 'en' ? 'Home' : 'Accueil', url: `${baseUrl}/` },
    { name: servicesLabel, url: `${baseUrl}/services` },
    { name: title, url: `${baseUrl}/services/${service.slug}` },
  ])

  return (
    <>
      {isPreview ? (
        <div className="sticky top-0 z-40 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
          Preview mode — this service is {service.published ? 'published' : 'not published'} yet.
          Only visible to signed-in editors.
        </div>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <ServiceClient
        service={service}
        locale={locale}
        sidebarServices={allServices.map((s) => ({
          slug: s.slug,
          titleFr: s.titleFr,
          titleEn: s.titleEn,
        }))}
      />
    </>
  )
}
