'use server'

import { verifyAdmin } from '@/lib/auth-guard'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createProductSchema, type CreateProductInput } from '@/lib/schemas/product'

const prisma = new PrismaClient()

/**
 * Example: Admin-only action to update product publish status
 * This demonstrates how to protect Server Actions with admin verification
 */
export async function updateProductPublishStatus(productId: string, published: boolean) {
  // Verify admin role - throws error if not admin
  await verifyAdmin()

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { published },
    })

    revalidatePath('/admin/products')

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Failed to update product:', error)
    return {
      success: false,
      error: 'Failed to update product',
    }
  }
}

/**
 * Example: Admin-only action to delete a product
 */
export async function deleteProduct(productId: string) {
  // Verify admin role - throws error if not admin
  await verifyAdmin()

  try {
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath('/admin/products')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete product:', error)
    return {
      success: false,
      error: 'Failed to delete product',
    }
  }
}

/**
 * Admin-only action to create a product with validation
 */
export async function createProduct(input: CreateProductInput) {
  // Verify admin role - throws error if not admin
  await verifyAdmin()

  // Validate input
  const validation = createProductSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: validation.data.title,
        title: validation.data.title,
        description: validation.data.description,
        price: validation.data.price ?? 0,
        type: validation.data.type,
        images: validation.data.images,
        published: validation.data.published,
        featured: validation.data.featured,
      },
    })

    revalidatePath('/admin/products')

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Failed to create product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

/**
 * Admin-only action to update a product with validation
 */
export async function updateProduct(productId: string, input: CreateProductInput) {
  // Verify admin role - throws error if not admin
  await verifyAdmin()

  // Validate input
  const validation = createProductSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        price: validation.data.price ?? 0,
        type: validation.data.type,
        images: validation.data.images,
        published: validation.data.published,
        featured: validation.data.featured,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/edit/${productId}`)
    revalidatePath('/products')
    revalidatePath('/services')
    revalidatePath('/')

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Failed to update product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    }
  }
}
