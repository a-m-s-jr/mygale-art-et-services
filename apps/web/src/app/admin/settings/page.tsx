import { getSiteSettings } from '@/lib/queries/settings'
import { requireRole } from '@/lib/auth'
import { getAdminT } from '@/lib/getLocale'
import SettingsForm from './SettingsForm'

export default async function AdminSettingsPage() {
  await requireRole('ADMIN')
  const [settings, adminT] = await Promise.all([getSiteSettings(), getAdminT()])
  const t = adminT.settings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-400">{t.subtitle}</p>
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
