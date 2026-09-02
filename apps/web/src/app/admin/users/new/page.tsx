import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import UserForm from '../UserForm'

export default async function NewUserPage() {
  const actor = await requireRole('ADMIN')
  const [departments, t] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { jobRoles: { orderBy: { name: 'asc' } } },
    }),
    getAdminT(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.users.newUser}</h1>
      </div>
      <UserForm
        mode="create"
        canGrantAdmin={actor.role === 'SUPER_ADMIN'}
        departments={departments}
      />
    </div>
  )
}
