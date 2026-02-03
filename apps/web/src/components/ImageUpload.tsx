'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState<number | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type on client
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setUploading(index)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      
      // Update the images array with the new URL
      const newImages = [...images]
      newImages[index] = data.url
      onChange(newImages)
      
      toast.success('Image uploaded successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      toast.error(message)
    } finally {
      setUploading(null)
      // Reset the input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleUrlChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    onChange(newImages)
  }

  const addImageField = () => {
    onChange([...images, ''])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages.length > 0 ? newImages : [''])
  }

  return (
    <div className="space-y-4">
      {images.map((imageUrl, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex gap-4">
            {/* Image Preview */}
            {imageUrl && (
              <div className="relative w-24 h-24 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}

            {/* Upload and URL Input */}
            <div className="flex-1 space-y-3">
              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileSelect(e, index)}
                  className="hidden"
                  id={`file-input-${index}`}
                  disabled={uploading === index}
                />
                <label
                  htmlFor={`file-input-${index}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-white transition ${
                    uploading === index ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading === index ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium">Upload Image</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, GIF, or WebP (max 5MB)
                </p>
              </div>

              {/* Manual URL Input (alternative) */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Or enter image URL directly
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={uploading === index}
                />
              </div>
            </div>

            {/* Remove Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="shrink-0 px-3 text-red-600 hover:bg-red-50 rounded-lg transition self-start"
                disabled={uploading === index}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add Another Image Button */}
      <button
        type="button"
        onClick={addImageField}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        disabled={uploading !== null}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Image
      </button>
    </div>
  )
}
