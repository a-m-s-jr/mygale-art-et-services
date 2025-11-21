/* eslint-disable @typescript-eslint/no-explicit-any */
/* apps/web/src/components/ServicesSidebar.tsx */
'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'

type Props = {
  activeSlug?: string
}

const SERVICES = [
  { slug: 'architecture', key: 'architectureTitle' },
  { slug: 'stylisme', key: 'stylismeTitle' },
  { slug: 'printing', key: 'printTitle' },
  { slug: 'vitraux', key: 'vitrauxTitle' },
  { slug: 'construction', key: 'constructionTitle' },
  { slug: 'web-development', key: 'webdevTitle' },
]

export default function ServicesSidebar({ activeSlug }: Props) {
  const { t } = useLocale()

  return (
    <div className="sticky top-24 p-4 border rounded-lg bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{t.servicesTitle}</h4>

      <ul className="space-y-2 text-sm">
        {SERVICES.map((s) => {
          const label = (t.services as any)[s.key] ?? s.slug
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
      <div className="mt-4 text-xs text-gray-500">
        Découvrez nos expériences, projets passés et solutions sur-mesure pour chaque service.
      </div>
    </div>
  )
}
