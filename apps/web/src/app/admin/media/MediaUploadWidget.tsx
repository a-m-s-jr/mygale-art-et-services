'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMedia } from '@/lib/mediaClient'

export default function MediaUploadWidget() {
  const [folder, setFolder] = useState('uploads')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const result = await uploadMedia(file, folder)
      if (!result.ok) {
        alert(result.error || `Upload failed for ${file.name}`)
      }
    }
    setUploading(false)
    e.target.value = ''
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 p-4">
      <div>
        <label className="text-xs text-neutral-400">Folder</label>
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value || 'uploads')}
          className="mt-1 block w-40 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-neutral-400">Upload files</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="mt-1 block text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 disabled:opacity-50"
        />
      </div>
      {uploading && <span className="text-xs text-neutral-400">Uploading...</span>}
    </div>
  )
}
