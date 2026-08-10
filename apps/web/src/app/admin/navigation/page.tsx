import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import NavigationTable from './NavigationTable'

export default async function AdminNavigationPage() {
  await requireRole('ADMIN')
  const items = await prisma.navigationItem.findMany({
    where: { deletedAt: null, parentId: null },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Navigation</h1>
        <p className="text-sm text-neutral-400">
          Edit labels, links, ordering, and visibility. Drag the handle to reorder.
        </p>
      </div>

      <NavigationTable items={items} />
    </div>
  )
}
