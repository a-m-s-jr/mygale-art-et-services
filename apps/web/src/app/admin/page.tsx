import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

const CARDS = [
  { href: '/admin/services', title: 'Services', desc: 'Create, edit, reorder, and publish service pages.', minRole: 'EDITOR' },
  { href: '/admin/homepage', title: 'Homepage', desc: 'Edit homepage sections, ordering, and visibility.', minRole: 'EDITOR' },
  { href: '/admin/about', title: 'About Page', desc: 'Edit the /about page content and SEO.', minRole: 'EDITOR' },
  { href: '/admin/media', title: 'Media Library', desc: 'Browse, search, upload, and reuse images.', minRole: 'EDITOR' },
  { href: '/admin/blog', title: 'Blog', desc: 'Create, edit, and publish blog posts.', minRole: 'EDITOR' },
  { href: '/admin/announcements', title: 'Announcements', desc: 'Schedule and manage announcement banners.', minRole: 'EDITOR' },
  { href: '/admin/contact-submissions', title: 'Contact Submissions', desc: 'Review and triage messages from the contact form.', minRole: 'EDITOR' },
  { href: '/admin/navigation', title: 'Navigation', desc: 'Edit nav labels, links, ordering, and visibility.', minRole: 'ADMIN' },
  { href: '/admin/social-links', title: 'Social Links', desc: 'Manage social links shown in Footer and Contact.', minRole: 'ADMIN' },
  { href: '/admin/redirects', title: 'Redirects', desc: 'Manage URL redirects so old links never break.', minRole: 'ADMIN' },
  { href: '/admin/settings', title: 'Settings', desc: 'Company info, contact details, map, and default SEO.', minRole: 'ADMIN' },
  { href: '/admin/users', title: 'Users', desc: 'Manage admin panel accounts and roles.', minRole: 'ADMIN' },
  { href: '/admin/audit-log', title: 'Audit Log', desc: 'Every create, edit, publish, delete, and login across the admin panel.', minRole: 'ADMIN' },
] as const

export default async function AdminHomePage() {
  const user = await getCurrentUser()
  const rank = user?.role ? ROLE_RANK[user.role] : 0
  const cards = CARDS.filter((card) => rank >= ROLE_RANK[card.minRole])

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
            <div className="text-lg font-semibold">{card.title}</div>
            <p className="text-sm text-neutral-400 mt-2">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
