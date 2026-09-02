import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import UserForm from '../../UserForm'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole('ADMIN')
  const { id } = await params
  const [user, departments, t] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { jobRoles: { orderBy: { name: 'asc' } } },
    }),
    getAdminT(),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.users.editUser}</h1>
      </div>
      <UserForm
        mode="edit"
        canGrantAdmin={actor.role === 'SUPER_ADMIN'}
        isSelf={actor.id === user.id}
        departments={departments}
        initial={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? 'USER',
          active: user.active,
          pagesRestricted: user.pagesRestricted,
          allowedPages: user.allowedPages,
          departmentId: user.departmentId,
          jobRoleId: user.jobRoleId,
        }}
      />
    </div>
  )
}
