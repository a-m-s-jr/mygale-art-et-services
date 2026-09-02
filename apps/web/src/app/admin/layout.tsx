import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { Toaster } from 'react-hot-toast'
import { requireRole } from '@/lib/auth'
import { hasPageAccess, OVERVIEW_SECTION_KEY } from '@/lib/adminPages'
import { getUnreadContactCount } from '@/lib/queries/contactSubmissions'
import { getAdminT } from '@/lib/getLocale'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'Admin | Mygale Art & Services',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Any active account with a role can open the admin shell — which pages
  // they actually see is entirely down to hasPageAccess() below (their role
  // rank by default, or an explicit per-user grant for restricted accounts).
  // Individual write actions that need EDITOR/ADMIN still gate themselves.
  const user = await requireRole('USER')

  const section = (await headers()).get('x-admin-section') ?? OVERVIEW_SECTION_KEY
  const allowed = hasPageAccess(user, section)
  const unreadContactCount = hasPageAccess(user, 'contact-submissions')
    ? await getUnreadContactCount()
    : 0
  const t = await getAdminT()

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
      <AdminSidebar
        user={{ role: user.role, pagesRestricted: user.pagesRestricted, allowedPages: user.allowedPages }}
        unreadContactCount={unreadContactCount}
      />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {allowed ? (
            children
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <h1 className="text-lg font-semibold">{t.layout.noAccessTitle}</h1>
              <p className="mt-2 text-sm text-neutral-400">{t.layout.noAccessBody}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
