import { requireRole } from '@/lib/auth'
import UserForm from '../UserForm'

export default async function NewUserPage() {
  const actor = await requireRole('ADMIN')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New User</h1>
      </div>
      <UserForm mode="create" canGrantAdmin={actor.role === 'SUPER_ADMIN'} />
    </div>
  )
}
