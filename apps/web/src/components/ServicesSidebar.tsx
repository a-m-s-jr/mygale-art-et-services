/* apps/web/src/components/ServicesSidebar.tsx */
'use client'

import React from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/locale'

type Props = {
  activeSlug?: string
  services: { slug: string; titleFr: string; titleEn: string }[]
  locale: Lang
}

export default function ServicesSidebar({ activeSlug, services, locale }: Props) {
  const title = locale === 'en' ? 'Our services' : 'Nos services'
  const tagline =
    locale === 'en'
      ? 'Discover our experience, past projects and tailor-made solutions for each service.'
      : 'Découvrez nos expériences, projets passés et solutions sur-mesure pour chaque service.'

  return (
    <div className="sticky top-24 p-4 border rounded-lg bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>

      <ul className="space-y-2 text-sm">
        {services.map((s) => {
          const label = locale === 'en' ? s.titleEn : s.titleFr
          const active = activeSlug === s.slug
          return (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className={`block px-3 py-2 rounded ${active ? 'bg-[#003366] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-4 text-xs text-gray-500">{tagline}</div>
    </div>
  )
}
