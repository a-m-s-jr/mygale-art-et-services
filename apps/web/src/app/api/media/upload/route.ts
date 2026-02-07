import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getCurrentUser } from '@/lib/auth'
import { buildCdnUrl, isSignedUrlsFallback, signUrl } from '@/lib/cloudfrontSigner'

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.mygaleartetservices.org'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET = process.env.AWS_S3_BUCKET || ''

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': FRONTEND_URL,
  }
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders() })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const timestamp = Date.now()
  const key = `${folder}/${timestamp}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    )
  } catch (err) {
    console.error('S3 upload error', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500, headers: corsHeaders() })
  }

  // Build URL: clean CDN URL in prod, signed URL in dev
  const cdnUrl = buildCdnUrl(key)
  const ttl = Number(process.env.CLOUDFRONT_COOKIE_TTL_SECONDS || '3600')
  const expiresAt = Math.floor(Date.now() / 1000) + ttl
  const url = isSignedUrlsFallback() ? signUrl(cdnUrl, expiresAt) : cdnUrl

  return NextResponse.json({ ok: true, key, url }, { headers: corsHeaders() })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': FRONTEND_URL,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
