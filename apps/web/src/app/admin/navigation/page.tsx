import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import NavigationTable from './NavigationTable'

export default async function AdminNavigationPage() {
  await requireRole('ADMIN')
  const [items, adminT] = await Promise.all([
    prisma.navigationItem.findMany({
      where: { deletedAt: null, parentId: null },
      orderBy: { order: 'asc' },
    }),
    getAdminT(),
  ])
  const t = adminT.navigation

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-400">{t.subtitle}</p>
      </div>

      <NavigationTable items={items} />
    </div>
  )
}
