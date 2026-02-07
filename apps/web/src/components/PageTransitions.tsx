/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PageTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [mounted, setMounted] = useState(false)
  const [pulse, setPulse] = useState(false)

  // Ensure component is mounted before animations
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    setPulse(false)
    const t = setTimeout(() => setPulse(true), 25)
    return () => clearTimeout(t)
  }, [pathname, mounted])

  // Prevent hydration mismatch by not animating until mounted
  if (!mounted) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <motion.div
      initial={false}
      animate={pulse ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.0, y: 8, scale: 0.998 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}
