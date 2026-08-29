import type { Role } from '@prisma/client'

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

/** The bare /admin dashboard — always accessible to anyone who can open the admin panel. */
export const OVERVIEW_SECTION_KEY = 'overview'

/**
 * Every active account's own attendance check-in page — always accessible
 * regardless of role rank or page restrictions, same as the overview. An
 * employee's ability to record their own attendance is not an "admin page"
 * permission.
 */
export const MY_ATTENDANCE_SECTION_KEY = 'my-attendance'

type AdminPage = {
  key: string
  href: string
  label: string
  minRole: Role
}

/**
 * Single source of truth for every admin section: its route, nav label, and
 * the minimum role rank it requires. Reused by AdminSidebar, the dashboard,
 * the per-user permission checkboxes on UserForm, and the centralized access
 * check in admin/layout.tsx.
 *
 * NOTE: `key` doubles as the second path segment under /admin/ (see
 * middleware.ts, which derives it from the URL) — renaming a route here
 * would silently orphan any `allowedPages` entries already granted for it.
 */
export const ADMIN_PAGES: AdminPage[] = [
  { key: 'services', href: '/admin/services', label: 'Services', minRole: 'EDITOR' },
  { key: 'homepage', href: '/admin/homepage', label: 'Homepage', minRole: 'EDITOR' },
  { key: 'about', href: '/admin/about', label: 'About Page', minRole: 'EDITOR' },
  { key: 'media', href: '/admin/media', label: 'Media Library', minRole: 'EDITOR' },
  { key: 'blog', href: '/admin/blog', label: 'Blog', minRole: 'EDITOR' },
  {
    key: 'blog-categories',
    href: '/admin/blog-categories',
    label: 'Blog Categories',
    minRole: 'EDITOR',
  },
  { key: 'announcements', href: '/admin/announcements', label: 'Announcements', minRole: 'EDITOR' },
  {
    key: 'contact-submissions',
    href: '/admin/contact-submissions',
    label: 'Inbox',
    minRole: 'EDITOR',
  },
  { key: 'navigation', href: '/admin/navigation', label: 'Navigation', minRole: 'ADMIN' },
  { key: 'social-links', href: '/admin/social-links', label: 'Social Links', minRole: 'ADMIN' },
  { key: 'redirects', href: '/admin/redirects', label: 'Redirects', minRole: 'ADMIN' },
  { key: 'settings', href: '/admin/settings', label: 'Settings', minRole: 'ADMIN' },
  { key: 'users', href: '/admin/users', label: 'Users', minRole: 'ADMIN' },
  { key: 'departments', href: '/admin/departments', label: 'Departments', minRole: 'ADMIN' },
  { key: 'attendance', href: '/admin/attendance', label: 'Attendance', minRole: 'ADMIN' },
  { key: 'audit-log', href: '/admin/audit-log', label: 'Audit Log', minRole: 'ADMIN' },
]

export type PageAccessUser = {
  role: Role | null
  pagesRestricted: boolean
  allowedPages: string[]
}

/**
 * Whether `user` can open the admin section identified by `sectionKey`.
 *
 * SUPER_ADMIN and ADMIN always have full access and can't be locked out.
 * Admin-tier pages (Users, Settings, Navigation, ...) are never reachable
 * below Admin rank, regardless of any per-user grant — that boundary can't
 * be widened via the permission checkboxes.
 *
 * For everyone else: an unrestricted account (the default) gets access to
 * every page its role rank already permits, same as before. A *restricted*
 * account's explicit `allowedPages` grant is what governs Editor-tier pages
 * instead — regardless of the account's own rank — so e.g. a Staff account
 * can be handed just Blog and Inbox without also being made an Editor.
 */
export function hasPageAccess(user: PageAccessUser, sectionKey: string): boolean {
  if (sectionKey === OVERVIEW_SECTION_KEY || sectionKey === MY_ATTENDANCE_SECTION_KEY) return true

  const rank = user.role ? ROLE_RANK[user.role] : 0
  const page = ADMIN_PAGES.find((p) => p.key === sectionKey)
  if (!page) return true

  if (rank >= ROLE_RANK.ADMIN) return true
  if (page.minRole === 'ADMIN') return false
  if (!user.pagesRestricted) return rank >= ROLE_RANK[page.minRole]

  return user.allowedPages.includes(sectionKey)
}
