import { requireRole } from '@/lib/auth'
import RedirectForm from '../RedirectForm'

export default async function NewRedirectPage() {
  await requireRole('ADMIN')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Redirect</h1>
      </div>
      <RedirectForm mode="create" />
    </div>
  )
}
