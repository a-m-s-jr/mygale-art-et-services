import { getAboutPage } from '@/lib/queries/about'
import { getAdminT } from '@/lib/getLocale'
import AboutForm from './AboutForm'

export default async function AdminAboutPage() {
  const [about, adminT] = await Promise.all([getAboutPage(), getAdminT()])
  const t = adminT.about

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-400">{t.subtitle}</p>
      </div>
      <AboutForm
        initial={{
          titleFr: about?.titleFr || '',
          titleEn: about?.titleEn || '',
          introFr: about?.introFr || '',
          introEn: about?.introEn || '',
          bodyFr: about?.bodyFr || '',
          bodyEn: about?.bodyEn || '',
          seoTitleFr: about?.seoTitleFr || '',
          seoTitleEn: about?.seoTitleEn || '',
          seoDescriptionFr: about?.seoDescriptionFr || '',
          seoDescriptionEn: about?.seoDescriptionEn || '',
          heroImageUrl: about?.heroImage?.url || '',
        }}
      />
    </div>
  )
}
