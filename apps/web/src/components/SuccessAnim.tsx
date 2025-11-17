/* eslint-disable react-hooks/purity */
'use client'
import React, { useEffect, useState } from 'react'

export default function SuccessAnim({ title = 'Thanks — sent' }: { title?: string }) {
  const [pieces, setPieces] = useState<number[]>([])

  useEffect(() => {
    // small "confetti" by creating a set of particles
    setPieces(Array.from({ length: 28 }, (_, i) => i))
    const t = setTimeout(() => setPieces([]), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-[#003366] grid place-items-center">
          {/* checkmark */}
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* confetti pieces */}
        <div className="absolute inset-0 pointer-events-none">
          {pieces.map((p) => (
            <span
              key={p}
              className="absolute block w-2 h-3 rounded-sm"
              style={{
                background: randomColor(p),
                left: `${Math.floor(Math.random() * 100)}%`,
                top: `${Math.floor(Math.random() * 30)}%`,
                transform: `translateY(${Math.random() * 10}px) rotate(${Math.random() * 360}deg)`,
                animation: `confetti-fall ${1.6 + Math.random()}s linear ${Math.random() * 0.5}s forwards`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-lg font-medium">{title}</div>

      <style>{`
        @keyframes confetti-fall {
          to { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function randomColor(seed: number) {
  const palette = ['#FF7A7A', '#FFCF66', '#7AE7C7', '#7AA7FF', '#D79BFF', '#FFC6E1']
  return palette[seed % palette.length]
}
