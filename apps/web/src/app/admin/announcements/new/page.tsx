import { getAdminT } from '@/lib/getLocale'
import AnnouncementForm from '../AnnouncementForm'

export default async function NewAnnouncementPage() {
  const t = (await getAdminT()).announcements
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.createTitle}</h1>
        <p className="text-sm text-neutral-400">{t.createSubtitle}</p>
      </div>
      <AnnouncementForm mode="create" />
    </div>
  )
}
