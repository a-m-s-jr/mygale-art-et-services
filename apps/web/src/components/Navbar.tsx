/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { lang, setLang, t } = useLocale()
  const pathname = usePathname() ?? '/'

  const [open, setOpen] = useState(false)
  const [openServices, setOpenServices] = useState(false)

  const servicesList = [
    { slug: 'architecture', label: (t.services as any).architectureTitle ?? 'Architecture' },
    { slug: 'stylisme', label: (t.services as any).stylismeTitle ?? 'Stylisme' },
    { slug: 'printing', label: (t.services as any).printTitle ?? 'Printing' },
    { slug: 'vitraux', label: (t.services as any).vitrauxTitle ?? 'Vitraux' },
    { slug: 'construction', label: (t.services as any).constructionTitle ?? 'Construction' },
    { slug: 'web-development', label: (t.services as any).webdevTitle ?? 'Web Dev' },
  ]

  const inServices = pathname.startsWith('/services')

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image src="/LOGO MYGALE 2.png" alt="Mygale" fill style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-[#003366]">{t.siteTitle}</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm relative">
          <Link
            href="/"
            className={`hover:underline ${pathname === '/' ? 'font-semibold text-[#003366]' : ''}`}
          >
            {lang === 'fr' ? 'Accueil' : 'Home'}
          </Link>

          <div className="relative">
            <Link href="/services">
              <button
                className={`hover:underline cursor-pointer ${inServices ? 'font-semibold text-[#003366]' : ''}`}
                aria-expanded={false}
              >
                {lang === 'fr' ? 'Services' : 'Services'}
              </button>
            </Link>

            {/* dropdown */}
            <div
              className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg 
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                         transition-all duration-200 z-50"
              // we show the dropdown on hover via wrapper "group" on parent if you prefer click-to-open, convert logic
            >
              <ul className="py-2">
                {servicesList.map((s) => {
                  const active = pathname === `/services/${s.slug}`
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className={`block px-4 py-2 hover:bg-gray-100 ${active ? 'font-semibold text-[#003366]' : ''}`}
                      >
                        {s.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <Link
            href="/contact"
            className={`hover:underline ${pathname === '/contact' ? 'font-semibold text-[#003366]' : ''}`}
          >
            {t.contactUs}
          </Link>

          <button
            aria-label="switch language"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="ml-3 px-3 py-1 rounded border"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </nav>

        {/* Mobile */}
        <button
          aria-label="toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden p-2 rounded-md border"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white/95">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
            <Link
              href="/"
              className={`py-2 ${pathname === '/' ? 'font-semibold text-[#003366]' : ''}`}
              onClick={() => setOpen(false)}
            >
              {lang === 'fr' ? 'Accueil' : 'Home'}
            </Link>

            <button
              className={`py-2 flex justify-between items-center ${inServices ? 'font-semibold text-[#003366]' : ''}`}
              onClick={() => setOpenServices((s) => !s)}
            >
              {lang === 'fr' ? 'Services' : 'Services'}
              <span>{openServices ? '−' : '+'}</span>
            </button>

            {openServices && (
              <div className="pl-4 flex flex-col gap-2">
                {servicesList.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className={`py-1 text-sm ${pathname === `/services/${s.slug}` ? 'font-semibold text-[#003366]' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/contact"
              className={`hover:underline py-2 ${pathname === '/contact' ? 'font-semibold text-[#003366]' : ''}`}
              onClick={() => setOpen(false)}
            >
              {t.contactUs}
            </Link>

            <button
              onClick={() => {
                setLang(lang === 'fr' ? 'en' : 'fr')
                setOpen(false)
              }}
              className="py-2 text-left"
            >
              {lang === 'fr' ? 'English' : 'Français'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
