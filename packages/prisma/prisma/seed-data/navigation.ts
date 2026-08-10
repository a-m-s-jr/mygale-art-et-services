export type SeedNavItem = {
  key: string
  labelFr: string
  labelEn: string
  href: string
  linkType: 'INTERNAL' | 'EXTERNAL' | 'SERVICES_DROPDOWN'
  order: number
}

export const SEED_NAVIGATION: SeedNavItem[] = [
  { key: 'home', labelFr: 'Accueil', labelEn: 'Home', href: '/', linkType: 'INTERNAL', order: 0 },
  {
    key: 'services',
    labelFr: 'Services',
    labelEn: 'Services',
    href: '/services',
    linkType: 'SERVICES_DROPDOWN',
    order: 1,
  },
  {
    key: 'contact',
    labelFr: 'Contactez-nous',
    labelEn: 'Contact us',
    href: '/contact',
    linkType: 'INTERNAL',
    order: 2,
  },
  { key: 'blog', labelFr: 'Blog', labelEn: 'Blog', href: '/blog', linkType: 'INTERNAL', order: 3 },
]
