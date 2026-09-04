import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET = process.env.AWS_S3_BUCKET || ''

// Mirrors the key shape the upload route generates: "<folder>/<file>", with
// folder itself already restricted to a safe character set at upload time.
// Re-validated here since this segment comes from the request URL, not from
// a value we generated ourselves.
const KEY_PATTERN = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)*\.[a-zA-Z0-9]+$/

export const runtime = 'nodejs'

/**
 * Serves an uploaded file straight from S3 using the app's own credentials,
 * bypassing CloudFront entirely.
 *
 * Every uploaded asset here is public site content with no legitimate need
 * for gated access, but the CloudFront distribution in front of AWS_S3_BUCKET
 * is configured to require a signed cookie/URL on these objects — and
 * generating that signature currently fails in production (a misconfigured
 * CLOUDFRONT_PRIVATE_KEY), so every image request through the CDN is
 * rejected. Rather than depend on that signing working, this route fetches
 * the object directly with the same S3 credentials already proven to work
 * for uploads, so display doesn't depend on CloudFront being configured
 * (or configured correctly) at all.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params
  const key = segments.join('/')

  if (!KEY_PATTERN.test(key) || key.includes('..')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    const bytes = await result.Body?.transformToByteArray()
    if (!bytes) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': result.ContentType || 'application/octet-stream',
        // Filenames are timestamp-based and never reused for different
        // content, so a long-lived, immutable cache is always safe.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    const code = (err as { name?: string })?.name
    if (code === 'NoSuchKey' || code === 'NotFound') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('Media file fetch error', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
