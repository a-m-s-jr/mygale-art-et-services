import { getAboutPage } from '@/lib/queries/about'
import AboutForm from './AboutForm'

export default async function AdminAboutPage() {
  const about = await getAboutPage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">About Page</h1>
        <p className="text-sm text-neutral-400">Edit the /about page content and SEO.</p>
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
