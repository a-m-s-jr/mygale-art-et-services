import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import SocialLinkForm from '../SocialLinkForm'

export default async function NewSocialLinkPage() {
  await requireRole('ADMIN')
  const t = (await getAdminT()).socialLinks

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.addTitle}</h1>
      </div>
      <SocialLinkForm mode="create" />
    </div>
  )
}
