import '../styles/globals.css'
import React from 'react'
import { LocaleProvider } from '@/lib/locale'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LogoSpider from '@/components/LogoSpider'

export const metadata = {
  title: 'Mygale Art et Services',
  description: 'Agence d’architecture, stylisme, imprimerie, art des vitraux — Yaoundé, Cameroon',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-black antialiased">
        <LocaleProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LocaleProvider>

        {/* loading overlay */}
        <div
          id="page-loader"
          className="fixed inset-0 z-50 hidden items-center justify-center bg-white/80"
        >
          <LogoSpider className="w-28 h-28 animate-float" />
        </div>
      </body>
    </html>
  )
}
