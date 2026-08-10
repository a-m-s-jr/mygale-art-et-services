import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublishedServices } from '@/lib/queries/services'
import { getSiteSettings } from '@/lib/queries/settings'
import { getLocale } from '@/lib/getLocale'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()])
  const title = locale === 'en' ? settings.defaultSeoTitleEn : settings.defaultSeoTitleFr
  const description =
    locale === 'en' ? settings.defaultSeoDescriptionEn : settings.defaultSeoDescriptionFr

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: { canonical: 'https://mygale-art-and-services.com/services' },
  }
}

export default async function ServicesIndexPage() {
  const [services, locale] = await Promise.all([getPublishedServices(), getLocale()])
  const title = locale === 'en' ? 'Our services' : 'Nos services'
  const learnMore = locale === 'en' ? 'Learn More ↗' : 'Apprendre encore plus ↗'

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s) => {
          const label = locale === 'en' ? s.titleEn : s.titleFr
          return (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group block rounded-lg border p-4 hover:shadow-lg transition"
            >
              <div className="h-40 w-full rounded overflow-hidden bg-gray-100">
                {s.heroImage?.url ? (
                  <Image
                    src={s.heroImage.url}
                    alt={label}
                    width={800}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                ) : null}
              </div>
              <h3 className="mt-4 font-semibold">{label}</h3>
              <div className="mt-2 text-sm text-[#003366] group-hover:underline">{learnMore}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
