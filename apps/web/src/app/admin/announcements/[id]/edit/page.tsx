import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AnnouncementForm from '../../AnnouncementForm'

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  })

  if (!announcement) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Announcement</h1>
        <p className="text-sm text-neutral-400">Update copy, schedule, and visibility.</p>
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
