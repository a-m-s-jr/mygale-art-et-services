import { getAdminT } from '@/lib/getLocale'
import ServiceForm from '../ServiceForm'

export default async function NewServicePage() {
  const t = (await getAdminT()).services
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.createPage}</h1>
        <p className="text-sm text-neutral-400">{t.createSubtitle}</p>
      </div>
      <ServiceForm mode="create" />
    </div>
  )
}
