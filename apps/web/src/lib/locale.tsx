'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'fr' | 'en'

/**
 * Translation shape used by the app components.
 * Keep keys stable so server components can rely on same names.
 */
export type Translations = {
  siteTitle: string
  heroSubtitle: string
  contactUs: string
  ourServices: string
  servicesTitle: string
  aboutTitle: string
  aboutText: string
  services: {
    architectureTitle: string
    architectureDesc: string
    stylismeTitle: string
    stylismeDesc: string
    printTitle: string
    printDesc: string
    vitrauxTitle: string
    vitrauxDesc: string
  }
  // small form field labels (for contact page later)
  name?: string
  email?: string
  phone?: string
  message?: string
  send?: string
  thanks?: string
}

const TRANSLATIONS: Record<Lang, Translations> = {
  fr: {
    siteTitle: 'MYGALE ART ET SERVICES',
    heroSubtitle:
      "Nous sommes une agence basée au Cameroun, proposant nos services dans l'art : Architecture, Stylisme, Imprimerie sur tissus, Art des vitraux.",
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
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone (optionnel)',
    message: 'Message',
    send: 'Envoyer',
    thanks: 'Merci — votre message a été envoyé.',
  },

  en: {
    siteTitle: 'MYGALE ART & SERVICES',
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
      architectureDesc: 'Design and supervision of projects of all types and scales',
      stylismeTitle: 'Fashion Design',
      stylismeDesc: 'Concept and fashion styling',
      printTitle: 'Textile Printing',
      printDesc: 'Textile printing & production',
      vitrauxTitle: 'Stained Glass Art',
      vitrauxDesc: 'Cathedral glass, bespoke creations',
    },
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    message: 'Message',
    send: 'Send',
    thanks: 'Thanks — your message has been sent.',
  },
}

/** Context value type */
type LocaleContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LocaleContext = createContext<LocaleContextValue>({
  lang: 'fr',
  // placeholder noop; will be replaced by provider
  setLang: () => {},
  t: TRANSLATIONS.fr,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')
  const value: LocaleContextValue = {
    lang,
    setLang,
    t: TRANSLATIONS[lang],
  }
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

/** Hook for components */
export function useLocale() {
  return useContext(LocaleContext)
}
