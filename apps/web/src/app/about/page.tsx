import React from 'react'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAboutPage } from '@/lib/queries/about'
import { getLocale } from '@/lib/getLocale'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [about, locale] = await Promise.all([getAboutPage(), getLocale()])
  if (!about) return {}

  const title = (locale === 'en' ? about.seoTitleEn : about.seoTitleFr) || undefined
  const description = (locale === 'en' ? about.seoDescriptionEn : about.seoDescriptionFr) || undefined

  return {
    title,
    description,
    alternates: { canonical: 'https://www.mygaleartetservices.org/about' },
  }
}

export default async function AboutPage() {
  const [about, locale] = await Promise.all([getAboutPage(), getLocale()])

  if (!about) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-gray-600">Content coming soon.</p>
      </div>
    )
  }

  const title = locale === 'en' ? about.titleEn : about.titleFr
  const intro = locale === 'en' ? about.introEn : about.introFr
  const body = locale === 'en' ? about.bodyEn : about.bodyFr

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {about.heroImage?.url ? (
        <div className="mb-8 h-56 w-full overflow-hidden rounded-xl md:h-72">
          <Image
            src={about.heroImage.url}
            alt={title}
            width={1200}
            height={500}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      ) : null}

      <h1 className="text-4xl font-bold text-[#003366] mb-4">{title}</h1>
      <p className="text-lg text-gray-700 leading-relaxed mb-8">{intro}</p>

      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  )
}
