/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { Session } from 'next-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null
  if (!session || !session.apiToken) return res.status(401).json({ error: 'Unauthorized' })

  const backend = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
  const id = req.query.id as string

  if (req.method === 'POST') {
    // forward draft to API (we saved as auditLog in API)
    const r = await fetch(`${backend}/contact-submissions/${id}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.apiToken}` },
      body: JSON.stringify({ draft: req.body.draft }),
    })
    const data = await r.json()
    return res.status(r.status).json(data)
  }

  if (req.method === 'GET') {
    const r = await fetch(`${backend}/contact-submissions/${id}/draft`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
    })
    const data = await r.json()
    return res.status(r.status).json(data)
  }

  return res.status(405).end()
}
