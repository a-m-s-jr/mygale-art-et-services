'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateAboutPage } from './actions'
import MediaPicker from '@/components/admin/MediaPicker'
import RichTextEditor from '@/components/admin/RichTextEditor'

const initialState = { error: '' as string | undefined }

type AboutFormData = {
  titleFr: string
  titleEn: string
  introFr: string
  introEn: string
  bodyFr: string
  bodyEn: string
  seoTitleFr: string
  seoTitleEn: string
  seoDescriptionFr: string
  seoDescriptionEn: string
  heroImageUrl: string
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

export default function AboutForm({ initial }: { initial: AboutFormData }) {
  const [titleFr, setTitleFr] = useState(initial.titleFr)
  const [titleEn, setTitleEn] = useState(initial.titleEn)
  const [introFr, setIntroFr] = useState(initial.introFr)
  const [introEn, setIntroEn] = useState(initial.introEn)
  const [bodyFr, setBodyFr] = useState(initial.bodyFr)
  const [bodyEn, setBodyEn] = useState(initial.bodyEn)
  const [seoTitleFr, setSeoTitleFr] = useState(initial.seoTitleFr)
  const [seoTitleEn, setSeoTitleEn] = useState(initial.seoTitleEn)
  const [seoDescriptionFr, setSeoDescriptionFr] = useState(initial.seoDescriptionFr)
  const [seoDescriptionEn, setSeoDescriptionEn] = useState(initial.seoDescriptionEn)
  const [heroImageUrl, setHeroImageUrl] = useState(initial.heroImageUrl)
  const [heroImageKey, setHeroImageKey] = useState('')

  const [state, formAction] = useActionState(updateAboutPage, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="heroImageKey" value={heroImageKey} />
      <input type="hidden" name="heroImageUrl" value={heroImageUrl} />

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-300">Title (FR) *</label>
            <input
              name="titleFr"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Title (EN) *</label>
            <input
              name="titleEn"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Intro (FR) *</label>
            <textarea
              name="introFr"
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={introFr}
              onChange={(e) => setIntroFr(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Intro (EN) *</label>
            <textarea
              name="introEn"
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={introEn}
              onChange={(e) => setIntroEn(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Body (FR) *</label>
            <div className="mt-1">
              <RichTextEditor value={bodyFr} onChange={setBodyFr} />
            </div>
            <input type="hidden" name="bodyFr" value={bodyFr} />
          </div>
          <div>
            <label className="text-sm text-neutral-300">Body (EN) *</label>
            <div className="mt-1">
              <RichTextEditor value={bodyEn} onChange={setBodyEn} />
            </div>
            <input type="hidden" name="bodyEn" value={bodyEn} />
          </div>
        </div>

        <MediaPicker
          label="Hero image"
          folder="about"
          url={heroImageUrl}
          onChange={(url, key) => {
            setHeroImageUrl(url)
            setHeroImageKey(key)
          }}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-neutral-300">SEO Title (FR)</label>
            <input
              name="seoTitleFr"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={seoTitleFr}
              onChange={(e) => setSeoTitleFr(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">SEO Title (EN)</label>
            <input
              name="seoTitleEn"
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={seoTitleEn}
              onChange={(e) => setSeoTitleEn(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">SEO Description (FR)</label>
            <textarea
              name="seoDescriptionFr"
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={seoDescriptionFr}
              onChange={(e) => setSeoDescriptionFr(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300">SEO Description (EN)</label>
            <textarea
              name="seoDescriptionEn"
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              value={seoDescriptionEn}
              onChange={(e) => setSeoDescriptionEn(e.target.value)}
            />
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
