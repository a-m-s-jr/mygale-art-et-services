/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { Session } from 'next-auth'
import ContactDetailClient from './ContactDetailClient'

type Props = { params: { id: string } }

export default async function SubmissionPage({ params }: Props) {
  const session = (await getServerSession(authOptions as any)) as Session | null
  if (!session?.apiToken) {
    return <div className="p-8">You must be logged in to view this submission.</div>
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'}/contact-submissions/${params.id}`,
    {
      headers: { Authorization: `Bearer ${session.apiToken}` },
      cache: 'no-store',
    },
  )

  if (!res.ok) {
    return <div className="p-8">Failed to load submission</div>
  }

  const submission = await res.json()
  return <ContactDetailClient initialData={submission} token={session.apiToken} />
}
