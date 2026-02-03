/**
 * Type-safe API client for Products endpoints
 */

import { ProductType } from '@prisma/client'
import { CreateProductInput } from '@/lib/schemas/product'

export interface Product {
  id: string
  title: string
  description: string
  price: number | null
  images: string[]
  type: ProductType
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
  count?: number
  total?: number
}

/**
 * Fetch all published products/services
 */
export async function getPublishedProducts(params?: {
  type?: ProductType
  limit?: number
  offset?: number
}): Promise<ApiResponse<Product[]>> {
  const searchParams = new URLSearchParams()
  
  if (params?.type) searchParams.set('type', params.type)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const url = `/api/products${searchParams.toString() ? `?${searchParams}` : ''}`
  
  const response = await fetch(url)
  return response.json()
}

/**
 * Fetch a single published product by ID
 */
export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  const response = await fetch(`/api/products/${id}`)
  return response.json()
}

/**
 * Admin: Fetch all products (including unpublished)
 */
export async function getAllProducts(params?: {
  type?: ProductType
  published?: boolean
  limit?: number
  offset?: number
}): Promise<ApiResponse<Product[]>> {
  const searchParams = new URLSearchParams()
  
  if (params?.type) searchParams.set('type', params.type)
  if (params?.published !== undefined) searchParams.set('published', params.published.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const url = `/api/admin/products${searchParams.toString() ? `?${searchParams}` : ''}`
  
  const response = await fetch(url)
  return response.json()
}

/**
 * Admin: Create a new product
 */
export async function createProductApi(
  data: CreateProductInput
): Promise<ApiResponse<Product>> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  return response.json()
}

/**
 * Admin: Update an existing product
 */
export async function updateProductApi(
  id: string,
  data: CreateProductInput
): Promise<ApiResponse<Product>> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  return response.json()
}

/**
 * Admin: Delete a product
 */
export async function deleteProductApi(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })
  
  return response.json()
}

/**
 * Admin: Toggle publish status
 */
export async function togglePublishStatus(
  id: string,
  currentProduct: Product
): Promise<ApiResponse<Product>> {
  return updateProductApi(id, {
    ...currentProduct,
    published: !currentProduct.published,
    featured: currentProduct.featured ?? false,
  })
}
