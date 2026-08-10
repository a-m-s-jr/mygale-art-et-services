import { getSignedCookies, getSignedUrl } from 'aws-cloudfront-sign'

const KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID
const PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n')
const COOKIE_DOMAIN = process.env.CLOUDFRONT_COOKIE_DOMAIN
const COOKIE_TTL_SECONDS = Number(process.env.CLOUDFRONT_COOKIE_TTL_SECONDS || '3600')
const CDN_URL = process.env.CDN_URL

/** Returns true when CloudFront signed cookies are properly configured */
export function isSignedCookiesEnabled(): boolean {
  return Boolean(KEY_PAIR_ID && PRIVATE_KEY && COOKIE_DOMAIN)
}

/** Returns true when we should fall back to signed URLs (localhost/dev) */
export function isSignedUrlsFallback(): boolean {
  return !isSignedCookiesEnabled()
}

export function createSignedCookies({
  resourcePattern,
  expiresAt,
}: {
  resourcePattern: string
  expiresAt: number
}) {
  // expiresAt is unix epoch seconds; library expects milliseconds or Date
  const expireTime = expiresAt * 1000

  const signed = getSignedCookies(resourcePattern, {
    keypairId: KEY_PAIR_ID as string,
    privateKeyString: PRIVATE_KEY as string,
    expireTime,
  })

  // returned signed cookie object keys are CloudFront-Policy, CloudFront-Signature, CloudFront-Key-Pair-Id
  return {
    policy: signed['CloudFront-Policy'] || '',
    signature: signed['CloudFront-Signature'] || '',
    keyPairId: signed['CloudFront-Key-Pair-Id'] || KEY_PAIR_ID || '',
    ttlSeconds: COOKIE_TTL_SECONDS,
    domain: COOKIE_DOMAIN,
  }
}

export function signUrl(url: string, expiresAt: number) {
  // expiresAt is unix epoch seconds; library expects milliseconds or Date
  const expireTime = expiresAt * 1000

  const signed = getSignedUrl(url, {
    keypairId: KEY_PAIR_ID as string,
    privateKeyString: PRIVATE_KEY as string,
    expireTime,
  })
  return signed
}

export function buildCdnUrl(key: string) {
  if (!CDN_URL) return key
  return `${CDN_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

export { CDN_URL }
