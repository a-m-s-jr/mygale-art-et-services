import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import RedirectForm from '../../RedirectForm'

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('ADMIN')
  const { id } = await params
  const redirectRow = await prisma.redirect.findUnique({ where: { id } })

  if (!redirectRow) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Redirect</h1>
      </div>
      <RedirectForm
        mode="edit"
        initial={{
          id: redirectRow.id,
          fromPath: redirectRow.fromPath,
          toPath: redirectRow.toPath,
          statusCode: redirectRow.statusCode,
          active: redirectRow.active,
        }}
      />
    </div>
  )
}
