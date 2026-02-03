import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/admin/products
 * Admin-only endpoint - returns all products (including unpublished)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Admin access required',
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const published = searchParams.get('published')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const products = await prisma.product.findMany({
      where: {
        ...(type && { type: type as 'PRODUCT' | 'SERVICE' }),
        ...(published !== null && published !== undefined && { 
          published: published === 'true' 
        }),
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    })

    const total = await prisma.product.count({
      where: {
        ...(type && { type: type as 'PRODUCT' | 'SERVICE' }),
        ...(published !== null && published !== undefined && { 
          published: published === 'true' 
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      total,
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}
