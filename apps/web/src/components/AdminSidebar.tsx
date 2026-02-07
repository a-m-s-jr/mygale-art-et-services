// apps/web/src/components/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import React from 'react'

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800 min-h-screen p-4">
      <div className="mb-6">
        <div className="text-xl font-semibold">MyGale</div>
        <div className="text-xs text-gray-500 mt-1">Admin</div>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/admin" className="px-3 py-2 rounded hover:bg-neutral-900">
          Overview
        </Link>
        <Link href="/admin/blog" className="px-3 py-2 rounded hover:bg-neutral-900">
          Blog
        </Link>
        <Link href="/admin/announcements" className="px-3 py-2 rounded hover:bg-neutral-900">
          Announcements
        </Link>
      </nav>
    </aside>
  )
}
