import { resolve, join } from 'path'

const MONOREPO_ROOT = resolve(__dirname, '..', '..') // repo root

export const reactStrictMode = true
export const images = {
  unoptimized: false,
  remotePatterns: [],
}
export const compress = true
export const poweredByHeader = false

// Make Next output its .next to the repo root so Vercel finds it at /vercel/path0/.next
export const distDir = join(MONOREPO_ROOT, '.next')

// For trace collection in monorepo, ensure outputFileTracingRoot points to monorepo root
export const outputFileTracingRoot = MONOREPO_ROOT

// If you also use turbopack config or want it disabled, set explicitly:
export const turbopack = {} // empty to silence turbopack warning OR
// turbopack: { root: MONOREPO_ROOT },
export function webpack(config) {
  return config
}
