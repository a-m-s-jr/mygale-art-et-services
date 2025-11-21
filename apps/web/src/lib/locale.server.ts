// server-side translation subset used by generateMetadata
export type Lang = 'fr' | 'en'

type ServicesTranslations = Record<
  string,
  {
    title: string
    desc: string
  }
>

export const SERVER_TRANSLATIONS: Record<
  Lang,
  { siteTitle: string; services: ServicesTranslations }
> = {
  fr: {
    siteTitle: 'MYGALE ART ET SERVICES',
    services: {
      architecture: {
        title: 'Architecture',
        desc: 'Conception architecturale, suivi de chantier, rénovation et gestion des projets — Yaoundé, Cameroun.',
      },
      stylisme: {
        title: 'Stylisme',
        desc: 'Création de collections, modélisme, patronage et accompagnement à la production.',
      },
      printing: {
        title: 'Impression textile',
        desc: 'Impression tissu: sérigraphie, impression numérique et préparation de fichiers.',
      },
      vitraux: {
        title: 'Vitraux',
        desc: 'Conception, fabrication et installation de réalisations verrières sur mesure.',
      },
      construction: {
        title: 'Construction',
        desc: 'Fourniture d’accessoires, supports techniques et solutions pour chantiers.',
      },
      'web-development': {
        title: 'Développement Web',
        desc: 'Sites vitrine, UI/UX, intégration et solutions web professionnelles.',
      },
    },
  },
  en: {
    siteTitle: 'MYGALE ART & SERVICES',
    services: {
      architecture: {
        title: 'Architecture',
        desc: 'Architectural design, site supervision, renovation and project management — Yaoundé, Cameroon.',
      },
      stylisme: {
        title: 'Fashion & Styling',
        desc: 'Collections creation, pattern making, prototypes and production support.',
      },
      printing: {
        title: 'Textile Printing',
        desc: 'Fabric printing: screen, digital and print-ready file preparation.',
      },
      vitraux: {
        title: 'Stained Glass',
        desc: 'Custom stained glass design, fabrication and installation services.',
      },
      construction: {
        title: 'Construction',
        desc: 'Accessories, technical support and supplies for construction projects.',
      },
      'web-development': {
        title: 'Web Development',
        desc: 'Showcase websites, UI/UX and professional web solutions.',
      },
    },
  },
}
