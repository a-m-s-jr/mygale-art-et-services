import { cache } from 'react'
import prisma from '@/lib/prisma'

async function fetchAboutPage() {
  return prisma.aboutPage.findUnique({
    where: { id: 'singleton' },
    include: { heroImage: { select: { url: true } } },
  })
}

export const getAboutPage = cache(fetchAboutPage)
