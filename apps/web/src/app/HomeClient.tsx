'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, type Lang } from '@/lib/locale'
import useReveal from '@/hooks/useReveal'
import type { getSiteSettings } from '@/lib/queries/settings'
import type { getHomepageSections } from '@/lib/queries/homepage'
import type { getFeaturedServices } from '@/lib/queries/services'

type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
type HomepageSection = Awaited<ReturnType<typeof getHomepageSections>>[number]
type FeaturedService = Awaited<ReturnType<typeof getFeaturedServices>>[number]

function pick(locale: Lang, fr: string | null | undefined, en: string | null | undefined) {
  return (locale === 'en' ? en : fr) ?? fr ?? en ?? ''
}

export default function HomeClient({
  settings,
  sections,
  services,
  locale,
}: {
  settings: SiteSettings
  sections: HomepageSection[]
  services: FeaturedService[]
  locale: Lang
}) {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)

  // activate reveal observer (adds .is-revealed class to .reveal elements)
  useReveal()

  return (
    <main className="min-h-screen bg-white text-black">
      {sections.map((section) => {
        if (section.type === 'HERO') {
          const bgImage = section.media?.url || '/hero-bg.jpg'
          const logoUrl = settings.logo?.url || '/LOGO MYGALE 2.png'
          return (
            <section
              key={section.id}
              className="relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url('${bgImage}')` }}
              aria-label="Hero"
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/80 to-white/60 pointer-events-none" />

              <div className="max-w-6xl mx-auto px-4 py-28 flex flex-col items-center text-center gap-6 relative z-10">
                <div className="w-36 h-36">
                  <Image
                    src={logoUrl}
                    alt="MYGALE logo"
                    width={144}
                    height={144}
                    className="w-full h-full animate-float"
                    priority
                  />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] drop-shadow-sm">
                  {pick(locale, section.titleFr, section.titleEn)}
                </h1>

                <p className="max-w-3xl text-gray-600">
                  {pick(locale, section.subtitleFr, section.subtitleEn)}
                </p>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={section.ctaHref || '/contact'}
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => setLoading(false), 600)
                    }}
                    className="px-5 py-3 rounded-lg bg-[#003366] text-white transform transition hover:scale-[1.03] hover:shadow-lg"
                  >
                    {loading ? 'Loading…' : pick(locale, section.ctaLabelFr, section.ctaLabelEn) || t.contactUs}
                  </Link>

                  <a
                    href="#services"
                    className="px-4 py-2 rounded-lg border transition hover:bg-gray-100 hover:scale-105"
                  >
                    {t.ourServices}
                  </a>
                  <a
                    href="#location"
                    className="px-4 py-2 rounded-lg border transition hover:bg-gray-100 hover:scale-105"
                  >
                    {t.findUs}
                  </a>
                </div>
              </div>
            </section>
          )
        }

        if (section.type === 'SERVICES_GRID') {
          return (
            <section key={section.id} id="services" className="py-16 bg-[#F4F6F8]">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-semibold mb-6 reveal">
                  {pick(locale, section.titleFr, section.titleEn) || t.servicesTitle}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      className="group reveal bg-white p-6 rounded-xl shadow-sm border cursor-pointer
                           transform transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div className="h-40 w-full bg-gray-100 rounded overflow-hidden">
                        {s.heroImage?.url ? (
                          <Image
                            src={s.heroImage.url}
                            alt={pick(locale, s.titleFr, s.titleEn)}
                            width={600}
                            height={320}
                            className="object-cover w-full h-full"
                          />
                        ) : null}
                      </div>

                      <h3 className="mt-4 font-semibold text-lg">
                        {pick(locale, s.titleFr, s.titleEn)}
                      </h3>
                      <p className="text-gray-600 mt-2 text-sm">
                        {pick(locale, s.summaryFr, s.summaryEn)}
                      </p>

                      <span
                        className="inline-block mt-3 text-[#003366] font-medium
                                 opacity-0 group-hover:opacity-100 transition"
                      >
                        <span className="text-[#003366] hover:underline">{t.learnMore}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (section.type === 'ABOUT') {
          return (
            <section key={section.id} className="py-16">
              <div className="max-w-6xl mx-auto px-4 reveal text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  {pick(locale, section.titleFr, section.titleEn)}
                </h2>
                <p className="text-gray-600">{pick(locale, section.bodyFr, section.bodyEn)}</p>
              </div>
            </section>
          )
        }

        if (section.type === 'MAP') {
          return (
            <section key={section.id} className="py-16 bg-[#F4F6F8]" id="location">
              <div className="max-w-6xl mx-auto px-4 reveal text-center">
                <h2 className="text-3xl font-semibold mb-6">
                  {pick(locale, section.titleFr, section.titleEn)}
                </h2>

                {settings.mapEmbedUrl ? (
                  <div className="w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-lg border">
                    <iframe
                      src={settings.mapEmbedUrl}
                      title="Mygale Art et Services location map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                ) : null}

                {settings.mapPlaceUrl ? (
                  <a
                    href={settings.mapPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block px-6 py-3 rounded-lg bg-[#003366] text-white font-medium shadow hover:scale-105 transition"
                  >
                    {pick(locale, section.ctaLabelFr, section.ctaLabelEn) || 'Google Maps'}
                  </a>
                ) : null}
              </div>
            </section>
          )
        }

        return null
      })}
    </main>
  )
}
