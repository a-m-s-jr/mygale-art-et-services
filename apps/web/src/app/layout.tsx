import '../styles/globals.css'
import React, { Suspense } from 'react'
import { LocaleProvider } from '@/lib/locale'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import PageTransitions from '@/components/PageTransitions' // client wrapper for AnimatePresence
import { Analytics } from '@vercel/analytics/next'
import AnnouncementBanner from '@/components/AnnouncementBanner'

export const metadata = {
  title: 'Mygale Art & Services – Architecture, Stylisme, Vitraux, Imprimerie',
  description:
    'Agence basée à Yaoundé spécialisée en architecture, stylisme, vitreries et impression textile.',
  openGraph: {
    title: 'Mygale Art & Services',
    description: 'Architecture, stylisme, art des vitraux, impression textile – Yaoundé.',
    images: ['/LOGO MYGALE 2.png'],
    url: 'https://mygale.vercel.app',
    siteName: 'Mygale Art & Services',
  },
  icons: {
    icon: '/LOGO MYGALE 2.png',
  },
  metadataBase: new URL('https://mygale-art-and-services.com'),
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-black antialiased">
        <LocaleProvider>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<div className="min-h-12" aria-hidden />}>
              <AnnouncementBanner />
            </Suspense>
            <Navbar />
            {/* PageTransitions handles the AnimatePresence keyed by pathname */}
            <PageTransitions>
              <main className="flex-1">{children}</main>
            </PageTransitions>
            <Footer />
          </div>
        </LocaleProvider>

        {/* loading overlay - page loader (hidden by default) */}
        <div
          id="page-loader"
          className="fixed inset-0 z-50 hidden items-center justify-center bg-white/80"
        >
          <Image
            className="w-28 h-28 animate-float"
            src="/LOGO MYGALE 2.png"
            alt="MYGALE ART ET SERVICES logo"
            width={100}
            height={20}
            priority
          />
        </div>

        <Analytics />
      </body>
    </html>
  )
}
