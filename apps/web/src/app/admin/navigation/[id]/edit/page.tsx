import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import NavigationItemForm from '../../NavigationItemForm'

export default async function EditNavigationItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('ADMIN')
  const { id } = await params
  const item = await prisma.navigationItem.findUnique({ where: { id } })

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Navigation Item</h1>
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
