import { cache } from 'react'
import prisma from '@/lib/prisma'

export const getNavigationItems = cache(async () => {
  return prisma.navigationItem.findMany({
    where: { deletedAt: null, visible: true, parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        where: { deletedAt: null, visible: true },
        orderBy: { order: 'asc' },
      },
    },
  })
})
