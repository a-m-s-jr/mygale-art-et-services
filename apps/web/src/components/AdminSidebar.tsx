/* apps/web/src/components/AdminSidebar.tsx */
'use client'
import Link from 'next/link'
import React from 'react'
import { signOut } from '@/app/auth/actions'
import type { Role } from '@prisma/client'
import { ADMIN_PAGES, hasPageAccess } from '@/lib/adminPages'
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

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-xl font-semibold">MyGale</div>
        <div className="text-xs text-gray-500 mt-1">Admin</div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/admin" className="px-3 py-2 rounded hover:bg-neutral-900">
          Overview
        </Link>
        <Link href="/admin/my-attendance" className="px-3 py-2 rounded hover:bg-neutral-900">
          My Attendance
        </Link>
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-neutral-900"
          >
            {link.label}
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
          Sign out
        </button>
      </form>
    </aside>
  )
}
