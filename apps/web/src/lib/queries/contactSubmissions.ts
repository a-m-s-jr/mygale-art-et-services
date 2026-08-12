import { cache } from 'react'
import prisma from '@/lib/prisma'

export const getUnreadContactCount = cache(async () => {
  return prisma.contactSubmission.count({ where: { status: 'new' } })
})
