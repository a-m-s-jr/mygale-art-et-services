import { cache } from 'react'
import prisma from '@/lib/prisma'

const mediaSelect = { url: true, altFr: true, altEn: true } as const

const serviceInclude = {
  heroImage: { select: mediaSelect },
  ogImage: { select: { url: true } },
  sections: {
    where: { deletedAt: null, visible: true },
    orderBy: { order: 'asc' as const },
    include: { media: { select: mediaSelect } },
  },
} as const

export const getPublishedServices = cache(async () => {
  return prisma.service.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: 'asc' },
    include: serviceInclude,
  })
})

export const getFeaturedServices = cache(async () => {
  return prisma.service.findMany({
    where: { published: true, deletedAt: null, featured: true },
    orderBy: { order: 'asc' },
    include: serviceInclude,
  })
})

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: serviceInclude,
  })
})

/** Used only by the admin-authenticated preview route — ignores the published flag. */
export const getServiceBySlugForPreview = cache(async (slug: string) => {
  return prisma.service.findFirst({
    where: { slug, deletedAt: null },
    include: serviceInclude,
  })
})

export const getAllServiceSlugs = cache(async () => {
  const rows = await prisma.service.findMany({
    where: { published: true, deletedAt: null },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
})
