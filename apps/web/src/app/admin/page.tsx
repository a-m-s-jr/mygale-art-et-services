import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { ADMIN_PAGES, hasPageAccess } from '@/lib/adminPages'
import { getUnreadContactCount } from '@/lib/queries/contactSubmissions'
import ContactUnreadBadge from '@/components/ContactUnreadBadge'

const CARD_DESCRIPTIONS: Record<string, string> = {
  services: 'Create, edit, reorder, and publish service pages.',
  homepage: 'Edit homepage sections, ordering, and visibility.',
  about: 'Edit the /about page content and SEO.',
  media: 'Browse, search, upload, and reuse images.',
  blog: 'Create, edit, and publish blog posts.',
  'blog-categories': 'Organize blog posts into categories.',
  announcements: 'Schedule and manage announcement banners.',
  'contact-submissions': 'Review and triage messages from the contact form.',
  navigation: 'Edit nav labels, links, ordering, and visibility.',
  'social-links': 'Manage social links shown in Footer and Contact.',
  redirects: 'Manage URL redirects so old links never break.',
  settings: 'Company info, contact details, map, and default SEO.',
  users: 'Manage admin panel accounts, roles, and page access.',
  'audit-log': 'Every create, edit, publish, delete, and login across the admin panel.',
}

export default async function AdminHomePage() {
  const user = await getCurrentUser()
  const cards = user ? ADMIN_PAGES.filter((page) => hasPageAccess(user, page.key)) : []
  const unreadContactCount =
    user && hasPageAccess(user, 'contact-submissions') ? await getUnreadContactCount() : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage all site content from one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <div className="flex items-center gap-2 text-lg font-semibold">
              {card.label}
              {card.key === 'contact-submissions' ? (
                <ContactUnreadBadge initialCount={unreadContactCount} showToast={false} />
              ) : null}
            </div>
            <p className="text-sm text-neutral-400 mt-2">{CARD_DESCRIPTIONS[card.key]}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
