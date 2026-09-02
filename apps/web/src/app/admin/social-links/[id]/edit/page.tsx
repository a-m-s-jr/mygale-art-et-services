import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import SocialLinkForm from '../../SocialLinkForm'

export default async function EditSocialLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole('ADMIN')
  const { id } = await params
  const [link, adminT] = await Promise.all([
    prisma.socialLink.findUnique({ where: { id } }),
    getAdminT(),
  ])

  if (!link) {
    notFound()
  }
  const t = adminT.socialLinks

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.editTitle}</h1>
      </div>
      <SocialLinkForm
        mode="edit"
        initial={{
          id: link.id,
          platform: link.platform,
          label: link.label || '',
          url: link.url,
          visible: link.visible,
        }}
      />
    </div>
  )
}
