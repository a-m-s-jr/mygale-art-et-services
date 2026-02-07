'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createAnnouncement, updateAnnouncement } from './actions'
import { uploadMedia } from '@/lib/mediaClient'

const initialState = { error: '' as string | undefined }

type AnnouncementFormData = {
  id?: string
  title: string
  message: string
  imageUrl?: string | null
  type: 'info' | 'warning' | 'promo'
  active: boolean
  startsAt?: Date | null
  endsAt?: Date | null
  dismissible: boolean
}

function formatDateTime(value?: Date | null) {
  if (!value) return ''
  const iso = new Date(value).toISOString()
  return iso.slice(0, 16)
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving...' : label}
    </button>
  )
}

export default function AnnouncementForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit'
  initial?: AnnouncementFormData
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [type, setType] = useState<AnnouncementFormData['type']>(initial?.type ?? 'info')
  const [active, setActive] = useState(initial?.active ?? true)
  const [startsAt, setStartsAt] = useState(formatDateTime(initial?.startsAt))
  const [endsAt, setEndsAt] = useState(formatDateTime(initial?.endsAt))
  const [dismissible, setDismissible] = useState(initial?.dismissible ?? true)
  const [uploading, setUploading] = useState(false)

  const action = mode === 'create' ? createAnnouncement : updateAnnouncement
  const [state, formAction] = useActionState(action, initialState)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await uploadMedia(file, 'announcements')
    setUploading(false)
    if (result.ok && result.url) {
      setImageUrl(result.url)
    } else {
      alert(result.error || 'Upload failed')
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      {mode === 'edit' && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div>
        <label className="text-sm text-neutral-300">Title *</label>
        <input
          name="title"
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-neutral-300">Message *</label>
        <textarea
          name="message"
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {/* Banner Image Upload */}
      <div>
        <label className="text-sm text-neutral-300">Banner Image (optional)</label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading && <span className="text-xs text-neutral-400">Uploading...</span>}
        </div>
        {imageUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Banner preview"
              className="h-24 rounded border border-neutral-700 object-cover"
            />
          </div>
        )}
        <input type="hidden" name="imageUrl" value={imageUrl} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm text-neutral-300">Type</label>
          <select
            name="type"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as AnnouncementFormData['type'])}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="promo">Promo</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            className="h-4 w-4"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <label className="text-sm text-neutral-300">Active</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="dismissible"
            className="h-4 w-4"
            checked={dismissible}
            onChange={(e) => setDismissible(e.target.checked)}
          />
          <label className="text-sm text-neutral-300">Dismissible</label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-neutral-300">Start Date (optional)</label>
          <input
            type="datetime-local"
            name="startsAt"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">End Date (optional)</label>
          <input
            type="datetime-local"
            name="endsAt"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={mode === 'create' ? 'Create Announcement' : 'Save Changes'} />
        <span className="text-xs text-neutral-400">Fields marked * are required.</span>
      </div>
    </form>
  )
}
