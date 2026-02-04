import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, Role } from '@prisma/client'
import { createProductSchema } from '@/lib/schemas/product'

const prisma = new PrismaClient()

/**
 * GET /api/products
 * Public endpoint - returns only published products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by type: PRODUCT or SERVICE
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const products = await prisma.product.findMany({
      where: {
        published: true,
        ...(type && { type: type as 'PRODUCT' | 'SERVICE' }),
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    })

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
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

/**
 * POST /api/products
 * Admin-only endpoint - create a new product
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: validation.data.title,
        title: validation.data.title,
        description: validation.data.description,
        price: validation.data.price ?? 0,
        type: validation.data.type,
        images: validation.data.images,
        published: validation.data.published,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 500 }
    )
  }
}
