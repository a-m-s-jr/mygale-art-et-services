import type { ReactNode } from 'react'
import { requireRole } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'Admin | Mygale Art & Services',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // The admin panel itself only requires EDITOR — individual pages/actions
  // that need ADMIN (Settings, Navigation, Users, etc.) gate themselves.
  const user = await requireRole('EDITOR')

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <AdminSidebar role={user.role} />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
