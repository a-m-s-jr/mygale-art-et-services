import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EDITOR: 3,
  STAFF: 2,
  VIEWER: 1,
  USER: 0,
}

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !user.role || ROLE_RANK[user.role] < ROLE_RANK.EDITOR) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder') || undefined
  const q = searchParams.get('q') || undefined

  const items = await prisma.media.findMany({
    where: {
      deletedAt: null,
      ...(folder ? { folder: { startsWith: folder } } : {}),
      ...(q
        ? {
            OR: [
              { key: { contains: q, mode: 'insensitive' } },
              { altFr: { contains: q, mode: 'insensitive' } },
              { altEn: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: {
      id: true,
      key: true,
      url: true,
      thumbnailUrl: true,
      folder: true,
      altFr: true,
      altEn: true,
      width: true,
      height: true,
    },
  })

  return NextResponse.json({ items })
}
