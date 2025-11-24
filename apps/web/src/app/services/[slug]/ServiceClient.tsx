'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLocale } from '@/lib/locale'
import ServicesSidebar from '@/components/ServicesSidebar'

type ContentBlock = {
  title: string
  items: string[]
  img?: string
}

type Props = {
  slug: string
  data: {
    titleKey: string
    descKey: string
    img?: string
    content: {
      fr: ContentBlock[]
      en: ContentBlock[]
    }
  }
}

/**
 * ServiceClient (client component)
 * - shows header + supporting image
 * - shows each content block with an image (block.img or fallback to service img)
 * - displays a sidebar (ServicesSidebar) with the activeSlug highlighted
 */
export default function ServiceClient({ slug, data }: Props) {
  const { t, lang } = useLocale()
  const locale = lang === 'fr' ? 'fr' : 'en'

  // Safe read from translations — cast to indexable keys
  const title = t.services[data.titleKey as unknown as keyof typeof t.services] as string
  const desc = t.services[data.descKey as unknown as keyof typeof t.services] as string

  const blocks = data.content?.[locale] ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="max-w-6xl mx-auto px-4 py-16"
    >
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">
          {lang === 'fr' ? 'Accueil' : 'Home'}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/services" className="hover:underline">
          {t.servicesTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{title}</span>
      </nav>

      {/* Main layout: content + sidebar */}
      <div className="md:grid md:grid-cols-[1fr_300px] md:gap-8">
        {/* Content column */}
        <div>
          {/* Header area: on desktop text left, image right; on mobile image below header */}
          <div className="mb-8">
            <div className="md:flex md:items-start md:gap-6">
              <div className="md:flex-1">
                <h1 className="text-4xl font-bold text-[#003366] mb-4">{title}</h1>
                <p className="text-gray-700 leading-relaxed">{desc}</p>
              </div>

              {/* supporting image on right (desktop) / below on mobile */}
              <div className="mt-6 md:mt-0 md:w-80 md:shrink-0">
                <Image
                  src={data.img ?? '/hero-bg.jpg'}
                  alt={title ?? ''}
                  width={900}
                  height={600}
                  className="w-full h-48 md:h-56 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-12">
            {blocks.map((block, i) => {
              // ensure blockImg is a plain string for the Image component
              const blockImg: string = block.img ?? data.img ?? '/hero-bg.jpg'

              return (
                <div key={i} className="md:grid md:grid-cols-2 md:gap-6 items-start">
                  {/* text */}
                  <div>
                    <h2 className="text-2xl font-semibold text-[#003366] mb-3">{block.title}</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {block.items.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </div>

                  {/* image (appears below on small screens, right on md+) */}
                  <div className="mt-4 md:mt-0">
                    <Image
                      src={blockImg}
                      alt={`${title} - ${block.title}`}
                      width={900}
                      height={600}
                      className="w-full h-full md:h-40 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="mt-10 md:mt-0">
          <ServicesSidebar activeSlug={slug} />
        </aside>
      </div>
    </motion.div>
  )
}
