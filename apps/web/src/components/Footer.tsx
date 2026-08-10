// apps/web/src/components/Footer.tsx
import React from 'react'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/settings'
import { getSocialLinks } from '@/lib/queries/socialLinks'
import { getNavigationItems } from '@/lib/queries/navigation'
import { getLocale } from '@/lib/getLocale'
import { PLATFORM_LABEL } from '@/lib/socialPlatforms'
import SocialIcon from './SocialIcon'

export default async function Footer() {
  const [settings, socialLinks, navItems, locale] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
    getNavigationItems(),
    getLocale(),
  ])

  const isEn = locale === 'en'
  const companyName = isEn ? settings.companyNameEn : settings.companyNameFr
  const description = isEn ? settings.taglineEn : settings.taglineFr
  const address = (isEn ? settings.addressEn : settings.addressFr) || settings.city
  const phones = [settings.phonePrimary, settings.phoneSecondary].filter(Boolean) as string[]
  const emails = [settings.emailPrimary, settings.emailContact].filter(
    (v, i, arr) => Boolean(v) && arr.indexOf(v) === i,
  ) as string[]

  const t = {
    navigation: isEn ? 'Navigation' : 'Navigation',
    contact: 'Contact',
    followUs: isEn ? 'Follow us' : 'Suivez-nous',
    allRightsReserved: isEn ? 'All rights reserved.' : 'Tous droits réservés.',
  }

  return (
    <footer className="border-t mt-12 py-10 bg-neutral-400 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid gap-8 text-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-semibold text-[#003366]">{companyName}</div>
          {description ? <p className="mt-2 text-gray-700">{description}</p> : null}
        </div>

        {navItems.length > 0 ? (
          <div>
            <div className="font-semibold text-[#003366]">{t.navigation}</div>
            <ul className="mt-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    className="hover:underline"
                    href={item.href || (item.linkType === 'SERVICES_DROPDOWN' ? '/services' : '#')}
                  >
                    {isEn ? item.labelEn : item.labelFr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <div className="font-semibold text-[#003366]">{t.contact}</div>
          <div className="mt-2 space-y-1">
            {address ? <div>{address}</div> : null}
            {phones.map((phone) => (
              <div key={phone}>
                <a className="hover:underline" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                  {phone}
                </a>
              </div>
            ))}
            {emails.map((email) => (
              <div key={email}>
                <a className="hover:underline" href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
            ))}
          </div>
        </div>

        {socialLinks.length > 0 ? (
          <div>
            <div className="font-semibold text-[#003366]">{t.followUs}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label || PLATFORM_LABEL[link.platform] || link.platform}
                  title={link.label || PLATFORM_LABEL[link.platform] || link.platform}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#003366] shadow-sm transition hover:scale-110 hover:bg-[#003366] hover:text-white"
                >
                  <SocialIcon platform={link.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-gray-500/30 text-xs text-gray-700">
        © {new Date().getFullYear()} {companyName}. {t.allRightsReserved}
      </div>
    </footer>
  )
}
