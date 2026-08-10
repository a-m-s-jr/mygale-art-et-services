import prisma from '@/lib/prisma'
import HomepageSectionsTable from './HomepageSectionsTable'

export default async function AdminHomepagePage() {
  const sections = await prisma.homepageSection.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage</h1>
        <p className="text-sm text-neutral-400">
          Edit homepage section content, ordering, and visibility. Drag the handle to reorder.
        </p>
      </div>

      <HomepageSectionsTable sections={sections} />
    </div>
  )
}
