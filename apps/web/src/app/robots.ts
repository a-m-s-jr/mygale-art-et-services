import type { MetadataRoute } from 'next'

const BASE_URL = 'https://mygale-art-and-services.com'

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
