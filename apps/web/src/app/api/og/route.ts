import { ImageResponse } from '@vercel/og'
export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'MYGALE Art & Services'

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#003366',
          color: 'white',
          width: '100%',
          height: '100%',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
