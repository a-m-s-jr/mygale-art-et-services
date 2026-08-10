const BASE_URL = 'https://mygale-art-and-services.com'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsonLdScript(data: Record<string, any>) {
  return JSON.stringify(data)
}

export function buildOrganizationJsonLd(params: {
  companyName: string
  logoUrl?: string | null
  addressLocality?: string | null
  addressCountry?: string | null
  streetAddress?: string | null
  phone?: string | null
  email?: string | null
  socialUrls: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: params.companyName,
    url: BASE_URL,
    ...(params.logoUrl ? { logo: params.logoUrl, image: params.logoUrl } : {}),
    ...(params.phone ? { telephone: params.phone } : {}),
    ...(params.email ? { email: params.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(params.streetAddress ? { streetAddress: params.streetAddress } : {}),
      ...(params.addressLocality ? { addressLocality: params.addressLocality } : {}),
      ...(params.addressCountry ? { addressCountry: params.addressCountry } : {}),
    },
    ...(params.socialUrls.length ? { sameAs: params.socialUrls } : {}),
  }
}

export function buildServiceJsonLd(params: {
  name: string
  description: string
  slug: string
  imageUrl?: string | null
  providerName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: `${BASE_URL}/services/${params.slug}`,
    ...(params.imageUrl ? { image: params.imageUrl } : {}),
    provider: {
      '@type': 'LocalBusiness',
      name: params.providerName,
    },
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
