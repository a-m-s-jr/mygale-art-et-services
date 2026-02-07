import { getActiveAnnouncement } from '@/lib/announcements'
import { NextResponse } from 'next/server'
import { signUrl, buildCdnUrl, isSignedUrlsFallback } from '@/lib/cloudfrontSigner'

export async function GET() {
  const announcement = await getActiveAnnouncement()

  if (!announcement) {
    return NextResponse.json(null)
  }

  // Re-sign image URL if it exists and we're using signed URLs (not cookies)
  let imageUrl = announcement.imageUrl
  if (imageUrl && isSignedUrlsFallback()) {
    try {
      // Extract the key from the URL (remove domain and query params if any)
      const urlObj = new URL(imageUrl)
      const key = urlObj.pathname.replace(/^\//, '') // Remove leading slash

      // Sign for 1 hour from now
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      const cdnUrl = buildCdnUrl(key)
      imageUrl = signUrl(cdnUrl, expiresAt)
    } catch (error) {
      console.error('Failed to re-sign image URL:', error)
      // Fall back to original URL if signing fails
    }
  }

  return NextResponse.json({
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    imageUrl: imageUrl,
    type: announcement.type,
    dismissible: announcement.dismissible,
  })
}

export const revalidate = 0 // No caching for API
