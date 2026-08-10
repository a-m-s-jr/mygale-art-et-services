'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { updateSiteSettings } from './actions'
import MediaPicker from '@/components/admin/MediaPicker'

const initialState = { error: '' as string | undefined }

type SettingsFormData = {
  companyNameFr: string
  companyNameEn: string
  taglineFr: string
  taglineEn: string
  addressFr: string
  addressEn: string
  city: string
  country: string
  phonePrimary: string
  phoneSecondary: string
  whatsapp: string
  emailPrimary: string
  emailContact: string
  mapEmbedUrl: string
  mapPlaceUrl: string
  latitude: string
  longitude: string
  businessHoursFr: string
  businessHoursEn: string
  logoUrl: string
  faviconUrl: string
  defaultSeoTitleFr: string
  defaultSeoTitleEn: string
  defaultSeoDescriptionFr: string
  defaultSeoDescriptionEn: string
  ogImageUrl: string
  googleSiteVerification: string
  analyticsId: string
  smtpFromName: string
  smtpFromEmail: string
  smtpReplyTo: string
}

function Field({
  label,
  name,
  value,
  onChange,
  textarea,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
}) {
  return (
    <div>
      <label className="text-sm text-neutral-300">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          name={name}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

export default function SettingsForm({ initial }: { initial: SettingsFormData }) {
  const [values, setValues] = useState(initial)
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl)
  const [logoKey, setLogoKey] = useState('')
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl)
  const [faviconKey, setFaviconKey] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState(initial.ogImageUrl)
  const [ogImageKey, setOgImageKey] = useState('')

  const [state, formAction] = useActionState(updateSiteSettings, initialState)

  function set<K extends keyof SettingsFormData>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="logoKey" value={logoKey} />
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="faviconKey" value={faviconKey} />
      <input type="hidden" name="faviconUrl" value={faviconUrl} />
      <input type="hidden" name="ogImageKey" value={ogImageKey} />
      <input type="hidden" name="ogImageUrl" value={ogImageUrl} />

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">Company Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Company Name (FR) *" name="companyNameFr" value={values.companyNameFr} onChange={(v) => set('companyNameFr', v)} />
          <Field label="Company Name (EN) *" name="companyNameEn" value={values.companyNameEn} onChange={(v) => set('companyNameEn', v)} />
          <Field label="Tagline (FR)" name="taglineFr" value={values.taglineFr} onChange={(v) => set('taglineFr', v)} />
          <Field label="Tagline (EN)" name="taglineEn" value={values.taglineEn} onChange={(v) => set('taglineEn', v)} />
          <MediaPicker label="Logo" folder="site" url={logoUrl} compact onChange={(url, key) => { setLogoUrl(url); setLogoKey(key) }} />
          <MediaPicker label="Favicon" folder="site" url={faviconUrl} compact onChange={(url, key) => { setFaviconUrl(url); setFaviconKey(key) }} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">Contact</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Address (FR)" name="addressFr" value={values.addressFr} onChange={(v) => set('addressFr', v)} />
          <Field label="Address (EN)" name="addressEn" value={values.addressEn} onChange={(v) => set('addressEn', v)} />
          <Field label="City" name="city" value={values.city} onChange={(v) => set('city', v)} />
          <Field label="Country" name="country" value={values.country} onChange={(v) => set('country', v)} />
          <Field label="Primary Phone" name="phonePrimary" value={values.phonePrimary} onChange={(v) => set('phonePrimary', v)} />
          <Field label="Secondary Phone" name="phoneSecondary" value={values.phoneSecondary} onChange={(v) => set('phoneSecondary', v)} />
          <Field label="WhatsApp (with country code)" name="whatsapp" value={values.whatsapp} onChange={(v) => set('whatsapp', v)} />
          <Field label="Primary Email" name="emailPrimary" value={values.emailPrimary} onChange={(v) => set('emailPrimary', v)} />
          <Field label="Contact Form Recipient Email" name="emailContact" value={values.emailContact} onChange={(v) => set('emailContact', v)} />
          <Field label="Business Hours (FR)" name="businessHoursFr" value={values.businessHoursFr} onChange={(v) => set('businessHoursFr', v)} textarea />
          <Field label="Business Hours (EN)" name="businessHoursEn" value={values.businessHoursEn} onChange={(v) => set('businessHoursEn', v)} textarea />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">Map / Location</h2>
        <p className="text-xs text-neutral-500">
          Used by the homepage Map section and the Contact page.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Google Maps embed URL" name="mapEmbedUrl" value={values.mapEmbedUrl} onChange={(v) => set('mapEmbedUrl', v)} textarea />
          <Field label="Google Maps place URL" name="mapPlaceUrl" value={values.mapPlaceUrl} onChange={(v) => set('mapPlaceUrl', v)} textarea />
          <Field label="Latitude" name="latitude" value={values.latitude} onChange={(v) => set('latitude', v)} />
          <Field label="Longitude" name="longitude" value={values.longitude} onChange={(v) => set('longitude', v)} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">Default SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Default SEO Title (FR)" name="defaultSeoTitleFr" value={values.defaultSeoTitleFr} onChange={(v) => set('defaultSeoTitleFr', v)} />
          <Field label="Default SEO Title (EN)" name="defaultSeoTitleEn" value={values.defaultSeoTitleEn} onChange={(v) => set('defaultSeoTitleEn', v)} />
          <Field label="Default SEO Description (FR)" name="defaultSeoDescriptionFr" value={values.defaultSeoDescriptionFr} onChange={(v) => set('defaultSeoDescriptionFr', v)} textarea />
          <Field label="Default SEO Description (EN)" name="defaultSeoDescriptionEn" value={values.defaultSeoDescriptionEn} onChange={(v) => set('defaultSeoDescriptionEn', v)} textarea />
          <MediaPicker label="Default social share image" folder="site" url={ogImageUrl} compact onChange={(url, key) => { setOgImageUrl(url); setOgImageKey(key) }} />
          <Field label="Google Site Verification" name="googleSiteVerification" value={values.googleSiteVerification} onChange={(v) => set('googleSiteVerification', v)} />
          <Field label="Analytics ID" name="analyticsId" value={values.analyticsId} onChange={(v) => set('analyticsId', v)} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold text-neutral-200">Email (display only)</h2>
        <p className="text-xs text-neutral-500">
          SMTP host/port/credentials are configured via server environment variables for security
          and are not editable here.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="From Name" name="smtpFromName" value={values.smtpFromName} onChange={(v) => set('smtpFromName', v)} />
          <Field label="From Email" name="smtpFromEmail" value={values.smtpFromEmail} onChange={(v) => set('smtpFromEmail', v)} />
          <Field label="Reply-To" name="smtpReplyTo" value={values.smtpReplyTo} onChange={(v) => set('smtpReplyTo', v)} />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold"
      >
        Save Settings
      </button>
    </form>
  )
}
