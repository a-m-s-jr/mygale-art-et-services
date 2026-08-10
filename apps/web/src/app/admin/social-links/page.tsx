import Link from 'next/link'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import SocialLinksTable from './SocialLinksTable'

export default async function AdminSocialLinksPage() {
  await requireRole('ADMIN')
  const links = await prisma.socialLink.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Social Links</h1>
          <p className="text-sm text-neutral-400">
            Shown automatically in the Footer and Contact page — only active links appear. Drag
            the handle to reorder.
          </p>
        </div>
        <Link
          href="/admin/social-links/new"
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold"
        >
          New Link
        </Link>
      </div>

      <SocialLinksTable links={links} />
    </div>
  )
}
