#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const src = path.join(root, '.env')

const targets = [
  path.join(root, 'apps', 'web', '.env'),
  path.join(root, 'packages', 'prisma', '.env'),
]

if (!fs.existsSync(src)) {
  console.error('❌ Root .env not found')
  process.exit(1)
}

const content = fs.readFileSync(src, 'utf8')

for (const target of targets) {
  fs.writeFileSync(target, content)
  console.log(`✅ Synced .env → ${path.relative(root, target)}`)
}
