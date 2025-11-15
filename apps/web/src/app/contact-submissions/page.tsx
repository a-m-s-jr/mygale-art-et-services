/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import ContactListClient from './ContactListClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../pages/api/auth/[...nextauth]'
import type { Session } from 'next-auth'

export default async function ContactSubmissionsPage() {
  const session = (await getServerSession(authOptions as any)) as Session | null

  if (!session?.apiToken) {
    return <div className="p-8">You must be logged in to view submissions.</div>
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'}/contact-submissions`,
    {
      headers: { Authorization: `Bearer ${session.apiToken}` },
      cache: 'no-store',
    },
  )

  const submissions = await res.json()
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Contact Submissions</h1>
      <ContactListClient initialData={submissions} token={session.apiToken} />
    </div>
  )
}
