import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'Admin | Mygale Art & Services',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
