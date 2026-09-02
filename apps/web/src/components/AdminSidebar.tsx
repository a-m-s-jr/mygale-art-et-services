/* apps/web/src/components/AdminSidebar.tsx */
'use client'
import Link from 'next/link'
import React from 'react'
import { signOut } from '@/app/auth/actions'
import type { Role } from '@prisma/client'
import { ADMIN_PAGES, NAV_TRANSLATION_KEY, hasPageAccess } from '@/lib/adminPages'
import { useAdminT, useLocale } from '@/lib/locale'
import ContactUnreadBadge from '@/components/ContactUnreadBadge'

type SidebarUser = {
  role: Role | null
  pagesRestricted: boolean
  allowedPages: string[]
}

export default function AdminSidebar({
  user,
  unreadContactCount,
}: {
  user: SidebarUser
  unreadContactCount: number
}) {
  const visibleLinks = ADMIN_PAGES.filter((page) => hasPageAccess(user, page.key))
  const t = useAdminT()
  const { lang, setLang } = useLocale()

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 min-h-screen p-4 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">MyGale</div>
          <div className="text-xs text-gray-500 mt-1">{t.nav.adminLabel}</div>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-900"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/admin" className="px-3 py-2 rounded hover:bg-neutral-900">
          {t.nav.overview}
        </Link>
        <Link href="/admin/my-attendance" className="px-3 py-2 rounded hover:bg-neutral-900">
          {t.nav.myAttendance}
        </Link>
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-neutral-900"
          >
            {t.nav[NAV_TRANSLATION_KEY[link.key] as keyof typeof t.nav] ?? link.label}
            {link.key === 'contact-submissions' ? (
              <ContactUnreadBadge initialCount={unreadContactCount} />
            ) : null}
          </Link>
        ))}
      </nav>

      <form action={signOut} className="mt-6 border-t border-neutral-800 pt-4">
        <button
          type="submit"
          className="w-full rounded px-3 py-2 text-left text-red-300 hover:bg-neutral-900"
        >
          {t.nav.signOut}
        </button>
      </form>
    </aside>
  )
}
