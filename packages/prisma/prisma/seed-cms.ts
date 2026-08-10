import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  PrismaClient,
  type BlockType,
  type HomepageSectionType,
  type NavLinkType,
  type SocialPlatform,
} from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { SEED_SERVICES } from './seed-data/services'
import { SEED_HOMEPAGE_SECTIONS } from './seed-data/homepage'
import { SEED_SETTINGS } from './seed-data/settings'
import { SEED_NAVIGATION } from './seed-data/navigation'
import { SEED_SOCIAL_LINKS } from './seed-data/social-links'
import { SEED_ABOUT_PAGE } from './seed-data/about'

// Load environment variables — resolve from this file's actual location
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Use DIRECT_URL (non-pooled) for reliable sequential writes, same as seed.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET = process.env.AWS_S3_BUCKET || ''
const CDN_URL = process.env.CDN_URL || ''
const PUBLIC_DIR = path.resolve(__dirname, '../../../apps/web/public')
const LOCAL_MODE = !CDN_URL || !BUCKET

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

let uploadedCount = 0
let skippedCount = 0

/**
 * In LOCAL_MODE: stores the public path directly as the URL (no S3 upload).
 * In production: uploads to S3 and stores the CDN URL.
 * Idempotent either way — keyed on relPublicPath or s3Key.
 */
async function upsertMedia(relPublicPath: string, s3Key: string, folder: string) {
  const key = LOCAL_MODE ? relPublicPath : s3Key
  const existing = await prisma.media.findUnique({ where: { key } })
  if (existing) {
    skippedCount++
    return existing
  }

  const absPath = path.join(PUBLIC_DIR, relPublicPath.replace(/^\//, ''))
  const ext = path.extname(absPath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
  const stat = fs.statSync(absPath)

  if (LOCAL_MODE) {
    uploadedCount++
    return prisma.media.create({
      data: { key, url: relPublicPath, folder, mimeType, size: stat.size },
    })
  }

  const buffer = fs.readFileSync(absPath)
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: s3Key, Body: buffer, ContentType: mimeType }),
  )
  uploadedCount++
  return prisma.media.create({
    data: { key: s3Key, url: `${CDN_URL.replace(/\/$/, '')}/${s3Key}`, folder, mimeType, size: buffer.length },
  })
}

function settingsScalarFields() {
  const { logoImagePath, faviconImagePath, defaultOgImagePath, ...scalars } = SEED_SETTINGS
  void logoImagePath
  void faviconImagePath
  void defaultOgImagePath
  return scalars
}

async function seedServices() {
  let created = 0
  let updated = 0

  for (const svc of SEED_SERVICES) {
    const heroMedia = await upsertMedia(
      svc.heroImagePath,
      `seed/services/${svc.slug}/hero${path.extname(svc.heroImagePath)}`,
      `services/${svc.slug}`,
    )

    const existingService = await prisma.service.findUnique({ where: { slug: svc.slug } })

    const data = {
      titleFr: svc.titleFr,
      titleEn: svc.titleEn,
      summaryFr: svc.summaryFr,
      summaryEn: svc.summaryEn,
      heroImageId: heroMedia.id,
      order: svc.order,
      featured: svc.featured,
      seoTitleFr: `${svc.titleFr} | Mygale Art & Services`,
      seoTitleEn: `${svc.titleEn} | Mygale Art & Services`,
      seoDescriptionFr: svc.summaryFr,
      seoDescriptionEn: svc.summaryEn,
    }

    const service = await prisma.service.upsert({
      where: { slug: svc.slug },
      update: data,
      create: { slug: svc.slug, published: true, ...data },
    })
    existingService ? updated++ : created++

    for (const section of svc.sections) {
      const sectionMedia = section.imagePath
        ? await upsertMedia(
            section.imagePath,
            `seed/services/${svc.slug}/blocks/${section.key}${path.extname(section.imagePath)}`,
            `services/${svc.slug}/blocks`,
          )
        : null

      const sectionData = {
        type: section.type as BlockType,
        titleFr: section.titleFr,
        titleEn: section.titleEn,
        itemsFr: section.itemsFr ?? [],
        itemsEn: section.itemsEn ?? [],
        bodyFr: section.bodyFr,
        bodyEn: section.bodyEn,
        mediaId: sectionMedia?.id,
        order: section.order,
      }

      await prisma.serviceSection.upsert({
        where: { serviceId_key: { serviceId: service.id, key: section.key } },
        update: sectionData,
        create: { serviceId: service.id, key: section.key, ...sectionData },
      })
    }
  }

  console.log(`Services: ${created} created, ${updated} updated (${SEED_SERVICES.length} total)`)
}

async function seedSettings() {
  const logoMedia = await upsertMedia(SEED_SETTINGS.logoImagePath, 'seed/site/logo.png', 'site')
  const faviconMedia = await upsertMedia(
    SEED_SETTINGS.faviconImagePath,
    'seed/site/favicon.png',
    'site',
  )
  const ogMedia = await upsertMedia(
    SEED_SETTINGS.defaultOgImagePath,
    'seed/site/og-default.jpg',
    'site',
  )

  const data = {
    ...settingsScalarFields(),
    logoId: logoMedia.id,
    faviconId: faviconMedia.id,
    defaultOgImageId: ogMedia.id,
  }

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  console.log('Site settings upserted')
}

async function seedAboutPage() {
  const heroMedia = await upsertMedia(
    SEED_ABOUT_PAGE.heroImagePath,
    `seed/about/hero${path.extname(SEED_ABOUT_PAGE.heroImagePath)}`,
    'about',
  )

  const data = {
    titleFr: SEED_ABOUT_PAGE.titleFr,
    titleEn: SEED_ABOUT_PAGE.titleEn,
    introFr: SEED_ABOUT_PAGE.introFr,
    introEn: SEED_ABOUT_PAGE.introEn,
    bodyFr: SEED_ABOUT_PAGE.bodyFr,
    bodyEn: SEED_ABOUT_PAGE.bodyEn,
    seoTitleFr: SEED_ABOUT_PAGE.seoTitleFr,
    seoTitleEn: SEED_ABOUT_PAGE.seoTitleEn,
    seoDescriptionFr: SEED_ABOUT_PAGE.seoDescriptionFr,
    seoDescriptionEn: SEED_ABOUT_PAGE.seoDescriptionEn,
    heroImageId: heroMedia.id,
  }

  await prisma.aboutPage.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  console.log('About page upserted')
}

async function seedHomepage() {
  for (const section of SEED_HOMEPAGE_SECTIONS) {
    const media = section.imagePath
      ? await upsertMedia(
          section.imagePath,
          `seed/homepage/${section.key}${path.extname(section.imagePath)}`,
          'homepage',
        )
      : null

    const data = {
      type: section.type as HomepageSectionType,
      titleFr: section.titleFr,
      titleEn: section.titleEn,
      subtitleFr: section.subtitleFr,
      subtitleEn: section.subtitleEn,
      bodyFr: section.bodyFr,
      bodyEn: section.bodyEn,
      ctaLabelFr: section.ctaLabelFr,
      ctaLabelEn: section.ctaLabelEn,
      ctaHref: section.ctaHref,
      mediaId: media?.id,
      order: section.order,
    }

    await prisma.homepageSection.upsert({
      where: { key: section.key },
      update: data,
      create: { key: section.key, ...data },
    })
  }

  console.log(`Homepage sections upserted: ${SEED_HOMEPAGE_SECTIONS.length}`)
}

async function seedNavigation() {
  for (const item of SEED_NAVIGATION) {
    const data = {
      labelFr: item.labelFr,
      labelEn: item.labelEn,
      href: item.href,
      linkType: item.linkType as NavLinkType,
      order: item.order,
    }
    await prisma.navigationItem.upsert({
      where: { key: item.key },
      update: data,
      create: { key: item.key, ...data },
    })
  }

  console.log(`Navigation items upserted: ${SEED_NAVIGATION.length}`)
}

async function seedSocialLinks() {
  for (const link of SEED_SOCIAL_LINKS) {
    const data = {
      platform: link.platform as SocialPlatform,
      label: link.label,
      url: link.url,
      order: link.order,
    }
    await prisma.socialLink.upsert({
      where: { key: link.key },
      update: data,
      create: { key: link.key, ...data },
    })
  }

  console.log(`Social links upserted: ${SEED_SOCIAL_LINKS.length}`)
}

async function main() {
  console.log('Seeding CMS content...')

  await seedServices()
  await seedSettings()
  await seedAboutPage()
  await seedHomepage()
  await seedNavigation()
  await seedSocialLinks()

  console.log(`Media: ${uploadedCount} uploaded to S3, ${skippedCount} already existed (skipped)`)
  console.log('CMS seed complete.')
}

main()
  .catch((error) => {
    console.error('❌ CMS seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
