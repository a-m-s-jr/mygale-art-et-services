'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const POLL_INTERVAL_MS = 25_000

export default function ContactUnreadBadge({
  initialCount,
  showToast = true,
}: {
  initialCount: number
  showToast?: boolean
}) {
  const [count, setCount] = useState(initialCount)
  const [syncedInitialCount, setSyncedInitialCount] = useState(initialCount)
  const lastCountRef = useRef(initialCount)

  // The server recomputes initialCount on actions like replying or changing
  // status (via revalidatePath) — pick that up immediately instead of
  // waiting for the next poll tick. Adjusting state during render (rather
  // than in an effect) avoids an extra cascading render.
  if (initialCount !== syncedInitialCount) {
    setSyncedInitialCount(initialCount)
    setCount(initialCount)
  }

  // Refs can't be written during render, so keep this one in sync via an
  // effect instead — it just needs to track the latest committed count for
  // the polling effect below to compare against, without resubscribing it.
  useEffect(() => {
    lastCountRef.current = count
  }, [count])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch('/api/admin/contact-unread-count', { cache: 'no-store' })
        if (!res.ok) return
        const data: { count?: number } = await res.json()
        if (cancelled || typeof data.count !== 'number') return

        if (showToast && data.count > lastCountRef.current) {
          const delta = data.count - lastCountRef.current
          toast(`${delta} new message${delta === 1 ? '' : 's'} in the Inbox`)
        }
        lastCountRef.current = data.count
        setCount(data.count)
      } catch {
        // Best-effort — a failed poll just retries on the next tick.
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    window.addEventListener('focus', poll)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', poll)
    }
  }, [showToast])

  if (count <= 0) return null

  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
      {count}
    </span>
  )
}
