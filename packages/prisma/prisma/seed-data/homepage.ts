export type SeedHomepageSection = {
  key: string
  type: 'HERO' | 'SERVICES_GRID' | 'ABOUT' | 'MAP'
  order: number
  titleFr?: string
  titleEn?: string
  subtitleFr?: string
  subtitleEn?: string
  bodyFr?: string
  bodyEn?: string
  ctaLabelFr?: string
  ctaLabelEn?: string
  ctaHref?: string
  /** path relative to apps/web/public */
  imagePath?: string
}

export const SEED_HOMEPAGE_SECTIONS: SeedHomepageSection[] = [
  {
    key: 'hero',
    type: 'HERO',
    order: 0,
    titleFr: 'MYGALE ART ET SERVICES',
    titleEn: 'MYGALE ART & SERVICES',
    subtitleFr:
      "Innovation, Créativité et Excellence au service de vos projets. Nous sommes une agence basée au Cameroun, proposant nos services dans l'art : Architecture, Stylisme, Imprimerie sur tissus, Art des vitraux.",
    subtitleEn:
      'Innovation, creativity and excellence for your projects. Yaoundé-based agency specialized in architecture, fashion design, textile printing and stained glass art.',
    ctaLabelFr: 'Contactez-nous',
    ctaLabelEn: 'Contact us',
    ctaHref: '/contact',
    imagePath: '/hero-bg.jpg',
  },
  {
    key: 'services_grid',
    type: 'SERVICES_GRID',
    order: 1,
    titleFr: 'Nos services',
    titleEn: 'Our services',
  },
  {
    key: 'about',
    type: 'ABOUT',
    order: 2,
    titleFr: 'À propos',
    titleEn: 'About',
    bodyFr:
      'Nous sommes une agence basée au Cameroun, proposant des services en architecture, stylisme, imprimerie sur tissus et art des vitraux. Basée à Yaoundé, nous réalisons des projets sur mesure.',
    bodyEn:
      'We are a Yaoundé-based agency offering architecture, fashion design, textile printing and stained glass services. We provide bespoke solutions.',
  },
  {
    key: 'map',
    type: 'MAP',
    order: 3,
    titleFr: 'Notre Localisation',
    titleEn: 'Our Location',
    ctaLabelFr: 'Google Maps',
    ctaLabelEn: 'Google Maps',
  },
]
