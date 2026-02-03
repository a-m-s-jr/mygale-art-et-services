import { PrismaClient } from '@prisma/client'
import { PromoBanner } from './PromoBanner'

const prisma = new PrismaClient()

async function getFeaturedItems() {
  return await prisma.product.findMany({
    where: {
      published: true,
      featured: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // Limit to 10 featured items
  })
}

export async function PromoBannerWrapper() {
  const featuredItems = await getFeaturedItems()
  
  return <PromoBanner featuredItems={featuredItems} />
}
