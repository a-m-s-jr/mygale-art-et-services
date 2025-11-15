import './globals.css'
import React from 'react'
import Navbar from '@/components/Navbar'
import { SessionProvider } from 'next-auth/react'
import Providers from './providers'

export const metadata = {
  title: 'MyGale',
  description: 'MyGale Art and Services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto p-4">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
