import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.mygaleartetservices.org'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
