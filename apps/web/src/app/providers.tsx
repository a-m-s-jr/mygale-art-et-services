'use client'

import { useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { initMediaSession } from '@/lib/mediaClient'

function MediaSessionInit() {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      // Initialize CloudFront signed cookies after login
      initMediaSession()
    }
  }, [status])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MediaSessionInit />
      {children}
    </SessionProvider>
  )
}
