'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateHomepageSection } from './actions'
import MediaPicker from '@/components/admin/MediaPicker'

const initialState = { error: '' as string | undefined }

type HomepageSectionFormData = {
  id: string
  type: 'HERO' | 'SERVICES_GRID' | 'ABOUT' | 'MAP' | 'STATS' | 'PARTNERS' | 'TESTIMONIALS'
  titleFr: string
  titleEn: string
  subtitleFr: string
  subtitleEn: string
  bodyFr: string
  bodyEn: string
  ctaLabelFr: string
  ctaLabelEn: string
  ctaHref: string
  mediaUrl: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

export default function HomepageSectionForm({ initial }: { initial: HomepageSectionFormData }) {
  const [titleFr, setTitleFr] = useState(initial.titleFr)
  const [titleEn, setTitleEn] = useState(initial.titleEn)
  const [subtitleFr, setSubtitleFr] = useState(initial.subtitleFr)
  const [subtitleEn, setSubtitleEn] = useState(initial.subtitleEn)
  const [bodyFr, setBodyFr] = useState(initial.bodyFr)
  const [bodyEn, setBodyEn] = useState(initial.bodyEn)
  const [ctaLabelFr, setCtaLabelFr] = useState(initial.ctaLabelFr)
  const [ctaLabelEn, setCtaLabelEn] = useState(initial.ctaLabelEn)
  const [ctaHref, setCtaHref] = useState(initial.ctaHref)
  const [mediaUrl, setMediaUrl] = useState(initial.mediaUrl)
  const [mediaKey, setMediaKey] = useState('')

  const [state, formAction] = useActionState(updateHomepageSection, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="mediaKey" value={mediaKey} />
      <input type="hidden" name="mediaUrl" value={mediaUrl} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-neutral-300">Title (FR)</label>
          <input
            name="titleFr"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Title (EN)</label>
          <input
            name="titleEn"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </div>
      </div>

      {initial.type === 'HERO' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-neutral-300">Subtitle (FR)</label>
              <textarea
                name="subtitleFr"
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                value={subtitleFr}
                onChange={(e) => setSubtitleFr(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-300">Subtitle (EN)</label>
              <textarea
                name="subtitleEn"
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-neutral-300">CTA Label (FR)</label>
              <input
                name="ctaLabelFr"
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                value={ctaLabelFr}
                onChange={(e) => setCtaLabelFr(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-300">CTA Label (EN)</label>
              <input
                name="ctaLabelEn"
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                value={ctaLabelEn}
                onChange={(e) => setCtaLabelEn(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-neutral-300">CTA Link</label>
              <input
                name="ctaHref"
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
              />
            </div>
          </div>

          <MediaPicker
            label="Background image"
            folder="homepage"
            url={mediaUrl}
            onChange={(url, key) => {
              setMediaUrl(url)
              setMediaKey(key)
            }}
          />
        </>
      ) : null}

      {initial.type === 'ABOUT' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-300">Body (FR)</label>
            <textarea
              name="bodyFr"
              rows={5}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={bodyFr}
              onChange={(e) => setBodyFr(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Body (EN)</label>
            <textarea
              name="bodyEn"
              rows={5}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {initial.type === 'MAP' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-300">&quot;Google Maps&quot; button label (FR)</label>
            <input
              name="ctaLabelFr"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={ctaLabelFr}
              onChange={(e) => setCtaLabelFr(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">&quot;Google Maps&quot; button label (EN)</label>
            <input
              name="ctaLabelEn"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={ctaLabelEn}
              onChange={(e) => setCtaLabelEn(e.target.value)}
            />
          </div>
          <p className="text-xs text-neutral-500 md:col-span-2">
            The map embed URL and address come from Settings, so they stay in sync with the
            Contact page.
          </p>
        </div>
      ) : null}

      {initial.type === 'SERVICES_GRID' ? (
        <p className="text-xs text-neutral-500">
          This section always displays the services marked &quot;Featured on homepage&quot; in
          Services, in their configured order.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
