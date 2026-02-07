'use client'

/**
 * Initializes CloudFront signed cookies (prod) or fetches signed URLs (dev).
 * Call after login and after uploads to refresh cookie TTL.
 */
export async function initMediaSession(keys: string[] = []): Promise<{ ok: boolean; urls?: string[]; signedUrls?: string[] }> {
  try {
    const res = await fetch('/api/media/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    })
    if (!res.ok) {
      console.warn('Media session init failed', res.status)
      return { ok: false }
    }
    return res.json()
  } catch (err) {
    console.error('initMediaSession error', err)
    return { ok: false }
  }
}

/**
 * Uploads a file to S3 via the backend and returns the CDN URL (or signed URL in dev).
 */
export async function uploadMedia(
  file: File,
  folder: string
): Promise<{ ok: boolean; key?: string; url?: string; error?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  try {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) {
      return { ok: false, error: data.error || 'Upload failed' }
    }
    // Refresh media session after upload
    await initMediaSession()
    return { ok: true, key: data.key, url: data.url }
  } catch (err) {
    console.error('uploadMedia error', err)
    return { ok: false, error: 'Network error' }
  }
}
