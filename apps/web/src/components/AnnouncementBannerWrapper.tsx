'use client'

import { useEffect, useState } from 'react'
import AnnouncementBannerClient from '@/components/AnnouncementBannerClient'

type AnnouncementData = {
  id: string
  title: string
  message: string
  imageUrl?: string | null
  type: 'info' | 'warning' | 'promo' | 'success' | 'error'
  dismissible: boolean
}

export default function AnnouncementBannerWrapper() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null)
  const [loaded, setLoaded] = useState(false)

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch('/api/announcements/current', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncement(data)
      } else {
        setAnnouncement(null)
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error)
      setAnnouncement(null)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    // Fetch initial announcement immediately
    fetchAnnouncement()

    // Poll for updates every 30 seconds to catch schedule changes
    const interval = setInterval(fetchAnnouncement, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!loaded) {
    // Return null while loading to avoid layout shift
    return null
  }

  if (!announcement) {
    return null
  }

  return <AnnouncementBannerClient announcement={announcement} />
}
