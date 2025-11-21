'use client'
import React, { useEffect, useState } from 'react'

export default function SuccessAnim({ show = true }: { show?: boolean }) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    setVisible(show)
  }, [show])

  if (!visible) return null

  return (
    <div className="success-anim fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="relative">
        <div className="confetti-wrapper">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} className={`confetti c-${i % 6}`} />
          ))}
        </div>

        <div className="checkmark-wrapper">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 52 52">
              <path
                d="M14 27 L22 34 L38 16"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
