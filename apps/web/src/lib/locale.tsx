'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'fr' | 'en'

export type Translations = {
  siteTitle: string
  heroSubtitle: string
  contactUs: string
  ourServices: string
  findUs: string
  servicesTitle: string
  aboutTitle: string
  aboutText: string
  Location: string
  name?: string
  email?: string
  phone?: string
  message?: string
  send?: string
  thanks?: string
  services: {
    architectureTitle: string
    architectureDesc: string

    stylismeTitle: string
    stylismeDesc: string

    printTitle: string
    printDesc: string

    vitrauxTitle: string
    vitrauxDesc: string

    constructionTitle: string
    constructionDesc: string

    webdevTitle: string
    webdevDesc: string

    architectureImg?: string
    stylismeImg?: string
    printImg?: string
    vitrauxImg?: string
    constructionImg?: string
  }
}

const TRANSLATIONS: Record<Lang, Translations> = {
  fr: {
    siteTitle: 'MYGALE ART ET SERVICES',
    heroSubtitle:
      "Innovation, Créativité et Excellence au service de vos projets. Nous sommes une agence basée au Cameroun, proposant nos services dans l'art : Architecture, Stylisme, Imprimerie sur tissus, Art des vitraux.",
    contactUs: 'Contactez-nous',
    ourServices: 'Nos services',
    servicesTitle: 'Nos services',
    findUs: 'Nous trouver',
    aboutTitle: 'À propos',
    aboutText:
      'Nous sommes une agence basée au Cameroun, proposant des services en architecture, stylisme, imprimerie sur tissus et art des vitraux. Basée à Yaoundé, nous réalisons des projets sur mesure.',
    Location: 'Notre Localisation',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone (optionnel)',
    message: 'Message',
    send: 'Envoyer',
    thanks: 'Merci — votre message a été envoyé.',
    services: {
      architectureTitle: 'Architecture',
      architectureDesc:
        'Conception architecturale, gestion de chantier, démarches administratives et services complémentaires pour projets résidentiels et commerciaux.',
      stylismeTitle: 'Stylisme',
      stylismeDesc:
        'Stylisme créatif, modélisme, prototypage, et consulting pour collections et productions mode.',
      printTitle: 'Imprimerie Textile',
      printDesc:
        'Solutions d’impression sur tissu — sérigraphie et impression numérique professionnelle.',
      vitrauxTitle: 'Vitraux & Miroiterie',
      vitrauxDesc:
        "Conception, fabrication et pose d'ouvrages en verre: vitraux, verrières, façades et menuiseries vitrées.",
      constructionTitle: 'Accessoires & Construction',
      constructionDesc:
        'Fourniture d’accessoires, conseils techniques et solutions pour vos chantiers.',
      webdevTitle: 'Développement Web',
      webdevDesc: 'Sites vitrines, UI/UX et solutions digitales adaptées à vos besoins.',
      architectureImg: '/architecture.jpg',
      stylismeImg: '/style.jpg',
      printImg: '/print.jpg',
      vitrauxImg: '/vitreaux.jpg',
      constructionImg: '/construction.jpg',
    },
  },

  en: {
    siteTitle: 'MYGALE ART & SERVICES',
    heroSubtitle:
      'Innovation, creativity and excellence for your projects. Yaoundé-based agency specialized in architecture, fashion design, textile printing and stained glass art.',
    contactUs: 'Contact us',
    ourServices: 'Our services',
    servicesTitle: 'Our services',
    findUs: 'Find us',
    aboutTitle: 'About',
    aboutText:
      'We are a Yaoundé-based agency offering architecture, fashion design, textile printing and stained glass services. We provide bespoke solutions.',
    Location: 'Our Location',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    message: 'Message',
    send: 'Send',
    thanks: 'Thanks — your message has been sent.',
    services: {
      architectureTitle: 'Architecture',
      architectureDesc:
        'Architectural design, construction management, regulatory assistance and complementary services for residential and commercial projects.',
      stylismeTitle: 'Fashion Design',
      stylismeDesc:
        'Creative styling, pattern-making, prototyping and consulting for collections and fashion productions.',
      printTitle: 'Textile Printing',
      printDesc: 'Textile printing solutions — screen printing and professional digital printing.',
      vitrauxTitle: 'Stained Glass & Glazing',
      vitrauxDesc:
        'Custom design, fabrication and installation of glassworks: stained glass, skylights, façades and glazing systems.',
      constructionTitle: 'Construction Accessories',
      constructionDesc:
        'Supply of accessories, technical guidance and construction site solutions.',
      webdevTitle: 'Web Development',
      webdevDesc: 'Showcase websites, UI/UX and digital solutions tailored to your needs.',
      architectureImg: '/architecture.jpg',
      stylismeImg: '/style.jpg',
      printImg: '/print.jpg',
      vitrauxImg: '/vitreaux.jpg',
      constructionImg: '/construction.jpg',
    },
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
  setLang: () => {},
  t: TRANSLATIONS.fr,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')
  const value: LocaleContextValue = { lang, setLang, t: TRANSLATIONS[lang] }
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
