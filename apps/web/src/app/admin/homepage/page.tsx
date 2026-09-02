import prisma from '@/lib/prisma'
import { getAdminT } from '@/lib/getLocale'
import HomepageSectionsTable from './HomepageSectionsTable'

export default async function AdminHomepagePage() {
  const [sections, adminT] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
    }),
    getAdminT(),
  ])
  const t = adminT.homepage

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-400">{t.subtitle}</p>
      </div>

      <HomepageSectionsTable sections={sections} />
    </div>
  )
}
