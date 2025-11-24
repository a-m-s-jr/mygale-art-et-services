'use client'

import { useState, useCallback } from 'react'

type Locale = 'fr' | 'en'

const DICT = {
  fr: {
    siteTitle: 'MYGALE — Art et Services',
    heroSubtitle:
      'Nous sommes une agence basée au Cameroun, proposant services en architecture, stylisme, imprimerie sur tissus et art des vitraux.',
    contactUs: 'Contactez-nous',
    ourServices: 'Nos services',
    servicesTitle: 'Nos services',
    aboutTitle: 'À propos',
    aboutText:
      'Nous sommes une agence basée au Cameroun, spécialisée en architecture, stylisme, art des vitraux et imprimerie sur tissus. Basée à Yaoundé, nous réalisons des projets sur mesure.',
    services: {
      architectureTitle: 'Architecture',
      architectureDesc: 'Réalisation et suivi de projets de toutes natures et envergures',
      stylismeTitle: 'Stylisme',
      stylismeDesc: 'Conception et stylisme fashion',
      printTitle: 'Imprimerie sur tissus',
      printDesc: 'Impression textile & production',
      vitrauxTitle: 'Art des Vitraux',
      vitrauxDesc: 'Verre cathédrale, créations sur mesure',
    },
  },
  en: {
    siteTitle: 'MYGALE — Art & Services',
    heroSubtitle:
      'We are a Yaoundé-based agency offering services in architecture, fashion design, fabric printing and stained glass art.',
    contactUs: 'Contact us',
    ourServices: 'Our services',
    servicesTitle: 'Our services',
    aboutTitle: 'About',
    aboutText:
      'We are a Yaoundé-based agency specializing in architecture, fashion design, stained glass art and fabric printing. We deliver bespoke projects.',
    services: {
      architectureTitle: 'Architecture',
      architectureDesc: 'Design and project management for all scales',
      stylismeTitle: 'Fashion',
      stylismeDesc: 'Design & styling for fashion',
      printTitle: 'Fabric Printing',
      printDesc: 'Textile printing & production',
      vitrauxTitle: 'Stained Glass',
      vitrauxDesc: 'Cathedral glass, bespoke creations',
    },
  },
}

export function useLocaleState(initial: Locale = 'fr') {
  const [locale, setLocale] = useState<Locale>(initial)
  const setLocaleCb = useCallback((l: Locale) => setLocale(l), [])
  return { locale, setLocale: setLocaleCb, t: DICT[locale] }
}

// convenience hook default export
export function useLocale() {
  return useLocaleState('fr')
}
