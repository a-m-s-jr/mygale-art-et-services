import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getAdminT } from '@/lib/getLocale'
import AnnouncementForm from '../../AnnouncementForm'

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [announcement, adminT] = await Promise.all([
    prisma.announcement.findUnique({ where: { id } }),
    getAdminT(),
  ])

  if (!announcement) {
    notFound()
  }
  const t = adminT.announcements

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.editTitle}</h1>
        <p className="text-sm text-neutral-400">{t.editSubtitle}</p>
      </div>
      <AnnouncementForm
        mode="edit"
        initial={{
          id: announcement.id,
          title: announcement.title,
          message: announcement.message,
          type: announcement.type as 'info' | 'warning' | 'promo',
          active: announcement.active,
          startsAt: announcement.startsAt,
          endsAt: announcement.endsAt,
          dismissible: announcement.dismissible,
        }}
      />
    </div>
  )
}
