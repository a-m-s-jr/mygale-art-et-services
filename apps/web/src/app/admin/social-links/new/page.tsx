import { requireRole } from '@/lib/auth'
import SocialLinkForm from '../SocialLinkForm'

export default async function NewSocialLinkPage() {
  await requireRole('ADMIN')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Social Link</h1>
      </div>
      <SocialLinkForm mode="create" />
    </div>
  )
}
