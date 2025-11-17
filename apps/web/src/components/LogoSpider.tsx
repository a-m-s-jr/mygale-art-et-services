// apps/web/src/components/LogoSpider.tsx
import React from 'react'

export default function LogoSpider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mygale logo"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#003366" />
          <stop offset="1" stopColor="#3399FF" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="8" fill="white" />
      {/* simplified spider / pen-nib shape */}
      <g transform="translate(8,8) scale(0.8)">
        <path
          d="M50 10 L65 30 L60 60 L50 70 L40 60 L35 30 Z"
          fill="url(#g)"
          stroke="#001f3f"
          strokeWidth="1"
        />
        {/* legs */}
        <g stroke="#003366" strokeWidth="2" strokeLinecap="round">
          <path d="M30 30 L10 10" />
          <path d="M20 40 L5 50" />
          <path d="M80 30 L100 10" />
          <path d="M90 40 L115 50" />
        </g>
      </g>
    </svg>
  )
}
