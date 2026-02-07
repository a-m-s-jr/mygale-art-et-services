#!/usr/bin/env node
/*
 Migration script: scans configured Prisma models/fields for S3 or CloudFront URLs,
 extracts the key, and replaces with either a CDN URL or the key only.

 Usage:
  node scripts/migrate-media-urls.js --dry-run --batch-size=100 --config=./migrate-media-config.json --store-keys-only

  Config file format (JSON):
  {
    "mappings": [
      { "model": "user", "field": "avatarUrl" },
      { "model": "product", "field": "imageUrl" }
    ]
  }

*/

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')

const dryRun = Boolean(argv['dry-run'] || argv.dryrun)
const batchSize = Number(argv['batch-size'] || argv.batchSize || 200)
const configPath = argv.config || './migrate-media-config.json'
const storeKeysOnly = Boolean(argv['store-keys-only'])
const CDN_HOST = process.env.CDN_URL || 'https://media.mygaleartetservices.org'

function loadConfig(path) {
  if (!fs.existsSync(path)) throw new Error('Config file not found: ' + path)
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function extractKeyFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  // match https://<host>/<key>
  const m = url.match(/^https?:\/\/[^/]+\/(.+)$/)
  if (m) return m[1]
  return null
}

async function processMapping(mapping) {
  const modelName = mapping.model
  const field = mapping.field
  const model = prisma[modelName]
  if (!model) {
    console.warn(`Prisma model not found: ${modelName}`)
    return { scanned: 0, updated: 0, skipped: 0 }
  }

  let cursor = undefined
  let scanned = 0
  let updated = 0
  let skipped = 0

  while (true) {
    const rows = await model.findMany({
      take: batchSize,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    })
    if (!rows || rows.length === 0) break

    for (const row of rows) {
      scanned++
      const val = row[field]
      if (!val || typeof val !== 'string') {
        skipped++
        continue
      }

      const key = extractKeyFromUrl(val)
      if (!key) {
        skipped++
        continue
      }

      const newValue = storeKeysOnly ? key : `${CDN_HOST.replace(/\/$/, '')}/${key}`
      if (newValue === val || (newValue === key && val === key)) {
        skipped++
        continue
      }

      console.log(
        `${dryRun ? '[DRY]' : '[UPDATE]'} ${modelName}.${field} id=${row.id} -> ${newValue}`,
      )
      if (!dryRun) {
        try {
          await model.update({ where: { id: row.id }, data: { [field]: newValue } })
          updated++
        } catch (err) {
          console.error('Update error', err)
        }
      }
    }

    // advance cursor
    cursor = rows[rows.length - 1].id
    if (rows.length < batchSize) break
  }

  return { scanned, updated: dryRun ? 0 : updated, skipped }
}

async function main() {
  console.log('Loading config:', configPath)
  const cfg = loadConfig(configPath)
  const mappings = cfg.mappings || []
  const summary = { scanned: 0, updated: 0, skipped: 0 }

  for (const m of mappings) {
    console.log('Processing mapping', m)
    const res = await processMapping(m)
    summary.scanned += res.scanned
    summary.updated += res.updated
    summary.skipped += res.skipped
  }

  console.log('Migration complete')
  console.log('Scanned:', summary.scanned)
  console.log('Updated:', summary.updated)
  console.log('Skipped:', summary.skipped)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect().then(() => process.exit(1))
})
