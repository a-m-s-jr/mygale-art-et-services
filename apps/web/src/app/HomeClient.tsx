'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import LogoSpider from '@/components/LogoSpider'
import { useLocale } from '@/lib/locale'
import Image from 'next/image'

export default function HomeClient() {
  // useLocale now returns { lang, setLang, t }
  const { lang, setLang, t } = useLocale()
  const [loading, setLoading] = useState(false)

  function handleContactClick() {
    setLoading(true)
    setTimeout(() => setLoading(false), 600)
  }

  const services = [
    { title: t.services.architectureTitle, desc: t.services.architectureDesc },
    { title: t.services.stylismeTitle, desc: t.services.stylismeDesc },
    { title: t.services.printTitle, desc: t.services.printDesc },
    { title: t.services.vitrauxTitle, desc: t.services.vitrauxDesc },
  ]

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
          <div className="w-36 h-36">
            <LogoSpider className="w-full h-full animate-float" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366]">{t.siteTitle}</h1>

          <p className="max-w-3xl text-gray-600">{t.heroSubtitle}</p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/contact"
              onClick={handleContactClick}
              className="px-5 py-3 rounded bg-[#003366] text-white"
            >
              {loading ? 'Loading…' : t.contactUs}
            </Link>

            <a href="#services" className="px-4 py-2 border rounded">
              {t.ourServices}
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 bg-[#F4F6F8]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">{t.servicesTitle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <article key={s.title} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-32 w-full bg-gray-100 rounded flex items-center justify-center">
                  <svg width="80" height="40" viewBox="0 0 80 40" className="opacity-80">
                    <rect width="80" height="40" fill="#eee" />
                  </svg>
                </div>

                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-4">{t.aboutTitle}</h2>
          <p className="text-gray-600">{t.aboutText}</p>
        </div>
      </section>
    </main>
  )
}
