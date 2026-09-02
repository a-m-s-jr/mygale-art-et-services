'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminTranslations } from '@/lib/adminTranslations'

export type Lang = 'fr' | 'en'

/**
 * UI-chrome strings only (nav labels, form labels, hover text). Page CONTENT
 * (homepage sections, services, footer/settings) is CMS-driven and fetched
 * server-side per-request using the locale resolved by getLocale().
 */
export type Translations = {
  siteTitle: string
  contactUs: string
  ourServices: string
  servicesTitle: string
  findUs: string
  name?: string
  email?: string
  phone?: string
  message?: string
  send?: string
  thanks?: string
  learnMore: string
  home: string
  services: string
}

const TRANSLATIONS: Record<Lang, Translations> = {
  fr: {
    siteTitle: 'MYGALE ART ET SERVICES',
    contactUs: 'Contactez-nous',
    ourServices: 'Nos services',
    servicesTitle: 'Nos services',
    findUs: 'Nous trouver',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone (optionnel)',
    message: 'Message',
    send: 'Envoyer',
    thanks: 'Merci — votre message a été envoyé.',
    learnMore: 'Apprendre encore plus ↗',
    home: 'Accueil',
    services: 'Services',
  },
  en: {
    siteTitle: 'MYGALE ART & SERVICES',
    contactUs: 'Contact us',
    ourServices: 'Our services',
    servicesTitle: 'Our services',
    findUs: 'Find us',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    message: 'Message',
    send: 'Send',
    thanks: 'Thanks — your message has been sent.',
    learnMore: 'Learn More ↗',
    home: 'Home',
    services: 'Services',
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

export function LocaleProvider({
  children,
  initialLang = 'fr',
}: {
  children: ReactNode
  initialLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()

  const setLang = (l: Lang) => {
    setLangState(l)
    fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: l }),
    })
      .catch(() => {})
      .finally(() => router.refresh())
  }

  const value: LocaleContextValue = { lang, setLang, t: TRANSLATIONS[lang] }
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

/** Admin panel translations for the current locale (Client Components). */
export function useAdminT() {
  const { lang } = useLocale()
  return getAdminTranslations(lang)
}
