import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }

  // Check if user has admin role
  if (session.user.role !== Role.ADMIN) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
