'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductType, Product } from '@prisma/client'
import { updateProduct, deleteProduct } from '@/app/admin/actions'
import { createProductSchema } from '@/lib/schemas/product'
import { ImageUpload } from '@/components/ImageUpload'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState<ProductType>(ProductType.PRODUCT)
  const [images, setImages] = useState<string[]>([''])
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  // Load existing product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to load product')
        }
        const product: Product & { featured?: boolean } = await response.json()
        
        setTitle(product.title)
        setDescription(product.description)
        setPrice(product.price?.toString() ?? '')
        setType(product.type)
        setImages(product.images.length > 0 ? product.images : [''])
        setPublished(product.published)
        setFeatured(product.featured ?? false)
        setIsLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product'
        setError(errorMessage)
        toast.error(errorMessage)
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      // Filter out empty image URLs
      const validImages = images.filter(img => img.trim() !== '')

      // Prepare data
      const data = {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        type,
        images: validImages,
        published,
        featured,
      }

      // Validate on client side
      const validation = createProductSchema.safeParse(data)
      if (!validation.success) {
        setFieldErrors(validation.error.flatten().fieldErrors)
        setError('Please fix the validation errors below')
        setIsSubmitting(false)
        return
      }

      // Submit to server
      const result = await updateProduct(params.id, validation.data)

      if (!result.success) {
        if ('errors' in result && result.errors) {
          setFieldErrors(result.errors as Record<string, string[]>)
        }
        setError(result.error || 'Failed to update product')
        toast.error(result.error || 'Failed to update product')
        setIsSubmitting(false)
        return
      }

      // Success
      toast.success('Product updated successfully!')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteProduct(params.id)

      if (!result.success) {
        toast.error(result.error || 'Failed to delete product')
        setIsDeleting(false)
        return
      }

      toast.success('Product deleted successfully!')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error(errorMessage)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Product/Service</h1>
          <p className="text-gray-600">Update your product or service details</p>
        </div>
        <Link
          href="/admin/products"
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
        >
          ← Back to List
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product/service title"
            required
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.title[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the product or service"
            required
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description[0]}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value={ProductType.PRODUCT}>Product</option>
            <option value={ProductType.SERVICE}>Service</option>
          </select>
          {fieldErrors.type && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.type[0]}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price (optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          {fieldErrors.price && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.price[0]}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <ImageUpload images={images} onChange={setImages} />
          {fieldErrors.images && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.images[0]}</p>
          )}
        </div>

        {/* Publish Status */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Publish this {type.toLowerCase()} (make it visible to the public)
          </label>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3 p-4 bg-linear-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
            <div className="font-semibold flex items-center gap-2">
              <span>⭐</span>
              <span>Feature in promotional banner</span>
            </div>
            <div className="text-gray-600 text-xs">
              {featured
                ? 'This will appear in the homepage promotional banner'
                : 'Only featured AND published items appear in the banner'}
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Product/Service'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &ldquo;{title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
