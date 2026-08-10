import { getSiteSettings } from '@/lib/queries/settings'
import { requireRole } from '@/lib/auth'
import SettingsForm from './SettingsForm'

export default async function AdminSettingsPage() {
  await requireRole('ADMIN')
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-400">
          Global company info, contact details, map, and default SEO.
        </p>
      </div>
      <SettingsForm
        initial={{
          companyNameFr: settings.companyNameFr || '',
          companyNameEn: settings.companyNameEn || '',
          taglineFr: settings.taglineFr || '',
          taglineEn: settings.taglineEn || '',
          addressFr: settings.addressFr || '',
          addressEn: settings.addressEn || '',
          city: settings.city || '',
          country: settings.country || '',
          phonePrimary: settings.phonePrimary || '',
          phoneSecondary: settings.phoneSecondary || '',
          whatsapp: settings.whatsapp || '',
          emailPrimary: settings.emailPrimary || '',
          emailContact: settings.emailContact || '',
          mapEmbedUrl: settings.mapEmbedUrl || '',
          mapPlaceUrl: settings.mapPlaceUrl || '',
          latitude: settings.latitude != null ? String(settings.latitude) : '',
          longitude: settings.longitude != null ? String(settings.longitude) : '',
          businessHoursFr: settings.businessHoursFr || '',
          businessHoursEn: settings.businessHoursEn || '',
          logoUrl: settings.logo?.url || '',
          faviconUrl: settings.favicon?.url || '',
          defaultSeoTitleFr: settings.defaultSeoTitleFr || '',
          defaultSeoTitleEn: settings.defaultSeoTitleEn || '',
          defaultSeoDescriptionFr: settings.defaultSeoDescriptionFr || '',
          defaultSeoDescriptionEn: settings.defaultSeoDescriptionEn || '',
          ogImageUrl: settings.defaultOgImage?.url || '',
          googleSiteVerification: settings.googleSiteVerification || '',
          analyticsId: settings.analyticsId || '',
          smtpFromName: settings.smtpFromName || '',
          smtpFromEmail: settings.smtpFromEmail || '',
          smtpReplyTo: settings.smtpReplyTo || '',
        }}
      />
    </div>
  )
}
