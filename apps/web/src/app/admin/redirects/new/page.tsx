import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import RedirectForm from '../RedirectForm'

export default async function NewRedirectPage() {
  await requireRole('ADMIN')
  const t = (await getAdminT()).redirects

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.addTitle}</h1>
      </div>
      <RedirectForm mode="create" />
    </div>
  )
}
