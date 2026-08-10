// apps/web/src/components/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import React from 'react'
import { signOut } from '@/app/auth/actions'
import type { Role } from '@prisma/client'

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

const LINKS = [
  { href: '/admin', label: 'Overview', minRole: 'EDITOR' },
  { href: '/admin/services', label: 'Services', minRole: 'EDITOR' },
  { href: '/admin/homepage', label: 'Homepage', minRole: 'EDITOR' },
  { href: '/admin/about', label: 'About Page', minRole: 'EDITOR' },
  { href: '/admin/media', label: 'Media Library', minRole: 'EDITOR' },
  { href: '/admin/blog', label: 'Blog', minRole: 'EDITOR' },
  { href: '/admin/blog-categories', label: 'Blog Categories', minRole: 'EDITOR' },
  { href: '/admin/announcements', label: 'Announcements', minRole: 'EDITOR' },
  { href: '/admin/contact-submissions', label: 'Contact Submissions', minRole: 'EDITOR' },
  { href: '/admin/navigation', label: 'Navigation', minRole: 'ADMIN' },
  { href: '/admin/social-links', label: 'Social Links', minRole: 'ADMIN' },
  { href: '/admin/redirects', label: 'Redirects', minRole: 'ADMIN' },
  { href: '/admin/settings', label: 'Settings', minRole: 'ADMIN' },
  { href: '/admin/users', label: 'Users', minRole: 'ADMIN' },
  { href: '/admin/audit-log', label: 'Audit Log', minRole: 'ADMIN' },
] as const

export default function AdminSidebar({ role }: { role: Role | null }) {
  const rank = role ? ROLE_RANK[role] : 0
  const visibleLinks = LINKS.filter((link) => rank >= ROLE_RANK[link.minRole])

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-xl font-semibold">MyGale</div>
        <div className="text-xs text-gray-500 mt-1">Admin</div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href} className="px-3 py-2 rounded hover:bg-neutral-900">
            {link.label}
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
