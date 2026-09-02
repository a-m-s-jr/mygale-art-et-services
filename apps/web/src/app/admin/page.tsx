import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { ADMIN_PAGES, NAV_TRANSLATION_KEY, hasPageAccess } from '@/lib/adminPages'
import { getUnreadContactCount } from '@/lib/queries/contactSubmissions'
import { getAdminT } from '@/lib/getLocale'
import ContactUnreadBadge from '@/components/ContactUnreadBadge'

export default async function AdminHomePage() {
  const user = await getCurrentUser()
  const cards = user ? ADMIN_PAGES.filter((page) => hasPageAccess(user, page.key)) : []
  const unreadContactCount =
    user && hasPageAccess(user, 'contact-submissions') ? await getUnreadContactCount() : 0
  const t = await getAdminT()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.overview.title}</h1>
        <p className="text-sm text-neutral-400 mt-1">{t.overview.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/my-attendance" className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="text-lg font-semibold">{t.nav.myAttendance}</div>
          <p className="text-sm text-neutral-400 mt-2">{t.overview.myAttendanceDesc}</p>
        </Link>
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <div className="flex items-center gap-2 text-lg font-semibold">
              {t.nav[NAV_TRANSLATION_KEY[card.key] as keyof typeof t.nav] ?? card.label}
              {card.key === 'contact-submissions' ? (
                <ContactUnreadBadge initialCount={unreadContactCount} showToast={false} />
              ) : null}
            </div>
            <p className="text-sm text-neutral-400 mt-2">
              {t.overview.cardDescriptions[card.key as keyof typeof t.overview.cardDescriptions]}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
