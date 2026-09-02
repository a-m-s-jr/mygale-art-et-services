import * as dotenv from 'dotenv'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'

// Load environment variables from root .env (same pattern as seed.ts)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '.env') })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

/**
 * One-time bootstrap: promotes a specific, named account to SUPER_ADMIN.
 * No account can ever reach SUPER_ADMIN through the app's own UI (an ADMIN
 * can't grant ADMIN/SUPER_ADMIN, and no account can change its own role),
 * so this exists purely to seed the very first SUPER_ADMIN. Deliberately
 * narrow: the target account is identified by exact email match (passed
 * explicitly to workflow_dispatch by a human), and the only no-op case is
 * an account that is already SUPER_ADMIN.
 */
async function main() {
  const email = process.env.PROMOTE_EMAIL?.trim().toLowerCase()
  if (!email) {
    throw new Error('Missing environment variable: PROMOTE_EMAIL')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`No user found with email: ${email}`)
  }

  if (user.role === 'SUPER_ADMIN') {
    console.log(`ℹ️  ${email} is already SUPER_ADMIN. Nothing to do.`)
    return
  }

  const previousRole = user.role ?? 'null'
  await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPER_ADMIN' } })

  await prisma.auditLog.create({
    data: {
      action: 'user.promote_super_admin',
      actorId: null,
      meta: { entityType: 'User', entityId: user.id, email, previousRole },
    },
  })

  console.log(`✅ Promoted ${email} from ${previousRole} to SUPER_ADMIN.`)
}

main()
  .catch((err) => {
    console.error('❌', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
