'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import LogoSpider from './LogoSpider'

export default function Navbar() {
  const { lang, setLang, t } = useLocale()

  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoSpider className="w-10 h-10" />
          <div>
            <div className="text-sm font-bold tracking-wider text-[#003366]">{t.siteTitle}</div>
            <div className="text-xs text-gray-500">Yaoundé, Cameroon</div>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm hover:underline">
            {lang === 'fr' ? 'Accueil' : 'Home'}
          </Link>

          <Link href="/contact" className="text-sm hover:underline">
            {t.contactUs}
          </Link>

          <button
            aria-label="switch language"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="ml-2 px-3 py-1 rounded border text-sm"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </nav>
      </div>
    </header>
  )
}
