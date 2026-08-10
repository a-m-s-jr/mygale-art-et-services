'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale'
import { usePathname } from 'next/navigation'

type NavItem = {
  id: string
  key: string | null
  labelFr: string
  labelEn: string
  href: string | null
  linkType: 'INTERNAL' | 'EXTERNAL' | 'SERVICES_DROPDOWN'
  openInNewTab: boolean
}

type ServiceLink = { slug: string; titleFr: string; titleEn: string }

export default function Navbar({
  navItems,
  services,
}: {
  navItems: NavItem[]
  services: ServiceLink[]
}) {
  const { lang, setLang, t } = useLocale()
  const pathname = usePathname() ?? '/'

  const [open, setOpen] = useState(false)
  const [openServices, setOpenServices] = useState(false)

  const servicesList = services.map((s) => ({
    slug: s.slug,
    label: lang === 'en' ? s.titleEn : s.titleFr,
  }))

  const inServices = pathname.startsWith('/services')

  function label(item: NavItem) {
    return lang === 'en' ? item.labelEn : item.labelFr
  }

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
          {navItems.map((item) => {
            if (item.linkType === 'SERVICES_DROPDOWN') {
              return (
                <div className="relative group" key={item.id}>
                  <Link href={item.href || '/services'}>
                    <button
                      className={`hover:underline cursor-pointer ${inServices ? 'font-semibold text-[#003366]' : ''}`}
                      aria-expanded={false}
                    >
                      {label(item)}
                    </button>
                  </Link>

                  {/* dropdown */}
                  <div
                    className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible
                         transition-all duration-200 z-50"
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
              )
            }

            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href || '#'))
            return (
              <Link
                key={item.id}
                href={item.href || '#'}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noreferrer' : undefined}
                className={`hover:underline ${active ? 'font-semibold text-[#003366]' : ''}`}
              >
                {label(item)}
              </Link>
            )
          })}

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
            {navItems.map((item) => {
              if (item.linkType === 'SERVICES_DROPDOWN') {
                return (
                  <div key={item.id}>
                    <button
                      className={`py-2 flex justify-between items-center w-full ${inServices ? 'font-semibold text-[#003366]' : ''}`}
                      onClick={() => setOpenServices((s) => !s)}
                    >
                      {label(item)}
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
                  </div>
                )
              }

              const active = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={`hover:underline py-2 ${active ? 'font-semibold text-[#003366]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {label(item)}
                </Link>
              )
            })}

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
