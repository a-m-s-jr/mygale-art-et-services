'use client'

/**
 * Uploads a file to S3 via the backend. The returned `url` points at this
 * app's own same-origin media proxy (see /api/media/file), not the CDN.
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
    // The uploaded file is served through this app's own same-origin proxy
    // (see /api/media/file), not the CDN, so there's no signed cookie to
    // refresh here.
    return { ok: true, key: data.key, url: data.url }
  } catch (err) {
    console.error('uploadMedia error', err)
    return { ok: false, error: 'Network error' }
  }
}
