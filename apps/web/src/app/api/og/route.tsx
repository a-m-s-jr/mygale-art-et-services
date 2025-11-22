import React from 'react'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const title = url.searchParams.get('title') || 'MYGALE Art & Services'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#003366',
          color: 'white',
          fontSize: 64,
          padding: '40px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
