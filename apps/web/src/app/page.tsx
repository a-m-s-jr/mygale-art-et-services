import React from 'react'
import HomeClient from './HomeClient'
import { getSiteSettings } from '@/lib/queries/settings'
import { getHomepageSections } from '@/lib/queries/homepage'
import { getFeaturedServices } from '@/lib/queries/services'
import { getLocale } from '@/lib/getLocale'

export const revalidate = 300

export default async function HomePage() {
  const [settings, sections, services, locale] = await Promise.all([
    getSiteSettings(),
    getHomepageSections(),
    getFeaturedServices(),
    getLocale(),
  ])

  return (
    <HomeClient settings={settings} sections={sections} services={services} locale={locale} />
  )
}
