'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateProductPublishStatus, deleteProduct } from '@/app/admin/actions'
import toast from 'react-hot-toast'

interface QuickActionsProps {
  productId: string
  productTitle: string
  isPublished: boolean
}

export function QuickActions({ productId, productTitle, isPublished }: QuickActionsProps) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleTogglePublish = async () => {
    setIsToggling(true)
    try {
      const result = await updateProductPublishStatus(productId, !isPublished)
      if (result.success) {
        toast.success(isPublished ? 'Unpublished successfully' : 'Published successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProduct(productId)
      if (result.success) {
        toast.success('Deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Edit Button */}
        <Link
          href={`/admin/products/edit/${productId}`}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
        >
          Edit
        </Link>

        {/* Publish/Unpublish Toggle */}
        <button
          onClick={handleTogglePublish}
          disabled={isToggling}
          className={`px-3 py-1.5 text-sm rounded transition ${
            isPublished
              ? 'text-orange-600 hover:bg-orange-50'
              : 'text-green-600 hover:bg-green-50'
          } disabled:opacity-50`}
        >
          {isToggling ? '...' : isPublished ? 'Unpublish' : 'Publish'}
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>&ldquo;{productTitle}&rdquo;</strong>? This action cannot be undone.
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
    </>
  )
}
