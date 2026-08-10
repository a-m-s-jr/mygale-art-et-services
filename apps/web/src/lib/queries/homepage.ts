import { cache } from 'react'
import prisma from '@/lib/prisma'

export const getHomepageSections = cache(async () => {
  return prisma.homepageSection.findMany({
    where: { deletedAt: null, visible: true },
    orderBy: { order: 'asc' },
    include: {
      media: { select: { url: true, altFr: true, altEn: true } },
    },
  })
})
