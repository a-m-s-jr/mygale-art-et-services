/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

/**
 * Safer page transitions:
 * - We DON'T use AnimatePresence or unmount the previous page,
 *   which avoids the blank white flash caused by server component swaps.
 * - On pathname change we briefly toggle `pulse` to trigger an "enter" animation.
 */

export default function PageTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    // trigger entrance animation whenever pathname changes
    // brief toggle is enough for framer-motion to animate from `initial` -> `animate`
    setPulse(false)

    // small timeout ensures any navigation/hydration swap completes enough before animation
    const t = setTimeout(() => setPulse(true), 25)

    return () => clearTimeout(t)
  }, [pathname])

  return (
    <motion.div
      // don't animate on initial SSR/hydration (initial={false})
      initial={false}
      animate={pulse ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.0, y: 8, scale: 0.998 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}
