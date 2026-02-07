import prisma from '@/lib/prisma'
import type { Announcement } from '@prisma/client'

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const now = new Date()
  return prisma.announcement.findFirst({
    where: {
      active: true,
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
      ],
    },
    orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
  })
}
