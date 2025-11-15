/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { Session } from 'next-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions as any)) as Session | null
  const apiToken = session?.apiToken
  if (!apiToken) return res.status(401).json({ error: 'Unauthorized' })

  const backend = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
  const r = await fetch(`${backend}/contact-submissions/${req.query.id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
    body: JSON.stringify(req.body),
  })

  const data = await r.json()
  return res.status(r.status).json(data)
}
