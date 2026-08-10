import { cache } from 'react'
import prisma from '@/lib/prisma'

export const getSocialLinks = cache(async () => {
  return prisma.socialLink.findMany({
    where: { deletedAt: null, visible: true },
    orderBy: { order: 'asc' },
  })
})
