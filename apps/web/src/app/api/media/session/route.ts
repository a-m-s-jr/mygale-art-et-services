import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  isSignedCookiesEnabled,
  isSignedUrlsFallback,
  createSignedCookies,
  signUrl,
  buildCdnUrl,
  CDN_URL,
} from '@/lib/cloudfrontSigner'

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.mygaleartetservices.org'

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': FRONTEND_URL,
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401, headers: corsHeaders() },
    )
  }

  const body = await request.json().catch(() => ({}))
  const keys: string[] = body.keys || []

  const ttl = Number(process.env.CLOUDFRONT_COOKIE_TTL_SECONDS || '3600')
  const expiresAt = Math.floor(Date.now() / 1000) + ttl

  // Determine allowed resource pattern based on role
  let resourcePattern = `${CDN_URL}/users/${user.id}/*`
  if (user.role === 'ADMIN') {
    // admin gets broader access for KYC and product review
    resourcePattern = `${CDN_URL}/*`
  }

  if (isSignedCookiesEnabled()) {
    const signed = createSignedCookies({ resourcePattern, expiresAt })

    const cookieAttrs = [
      'HttpOnly',
      'Secure',
      'SameSite=None',
      'Path=/',
      `Domain=${signed.domain}`,
      `Max-Age=${signed.ttlSeconds}`,
    ].join('; ')

    // Vercel/Edge: use response.headers.append for multiple Set-Cookie headers
    const response = new NextResponse(
      JSON.stringify({ ok: true, urls: keys.map((k) => buildCdnUrl(k)) }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
      },
    )

    response.headers.append(
      'Set-Cookie',
      `CloudFront-Policy=${encodeURIComponent(signed.policy)}; ${cookieAttrs}`,
    )
    response.headers.append(
      'Set-Cookie',
      `CloudFront-Signature=${encodeURIComponent(signed.signature)}; ${cookieAttrs}`,
    )
    response.headers.append(
      'Set-Cookie',
      `CloudFront-Key-Pair-Id=${encodeURIComponent(signed.keyPairId)}; ${cookieAttrs}`,
    )

    return response
  }

  // Fallback: signed URLs response (used for localhost/dev)
  if (isSignedUrlsFallback()) {
    const urls = keys.map((k) => {
      const url = buildCdnUrl(k)
      return signUrl(url, expiresAt)
    })
    return NextResponse.json({ ok: true, signedUrls: urls }, { headers: corsHeaders() })
  }

  return NextResponse.json(
    { error: 'Media signing not configured' },
    { status: 500, headers: corsHeaders() },
  )
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
