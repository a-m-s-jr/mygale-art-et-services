import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import HomepageSectionForm from '../../HomepageSectionForm'

export default async function EditHomepageSectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const section = await prisma.homepageSection.findUnique({
    where: { id },
    include: { media: { select: { url: true } } },
  })

  if (!section) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Homepage Section</h1>
        <p className="text-sm text-neutral-400">{section.type}</p>
      </div>
      <HomepageSectionForm
        initial={{
          id: section.id,
          type: section.type,
          titleFr: section.titleFr || '',
          titleEn: section.titleEn || '',
          subtitleFr: section.subtitleFr || '',
          subtitleEn: section.subtitleEn || '',
          bodyFr: section.bodyFr || '',
          bodyEn: section.bodyEn || '',
          ctaLabelFr: section.ctaLabelFr || '',
          ctaLabelEn: section.ctaLabelEn || '',
          ctaHref: section.ctaHref || '',
          mediaUrl: section.media?.url || '',
        }}
      />
    </div>
  )
}
