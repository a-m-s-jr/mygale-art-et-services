import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import NavigationItemForm from '../../NavigationItemForm'

export default async function EditNavigationItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('ADMIN')
  const { id } = await params
  const [item, adminT] = await Promise.all([
    prisma.navigationItem.findUnique({ where: { id } }),
    getAdminT(),
  ])

  if (!item) {
    notFound()
  }
  const t = adminT.navigation

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.editTitle}</h1>
      </div>
      <NavigationItemForm
        initial={{
          id: item.id,
          labelFr: item.labelFr,
          labelEn: item.labelEn,
          href: item.href || '',
          linkType: item.linkType,
          openInNewTab: item.openInNewTab,
        }}
      />
    </div>
  )
}
