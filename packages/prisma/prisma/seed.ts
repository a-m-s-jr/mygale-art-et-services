import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient, SubmissionStatus } from '@prisma/client'
const prisma = new PrismaClient()

const passwordPlainAdmin = process.env.SEED_ADMIN_PASSWORD

if (!passwordPlainAdmin) {
  throw new Error('Missing environment variable: SEED_ADMIN_PASSWORD')
}

const adminPasswordHash = await bcrypt.hash(passwordPlainAdmin, 10)

const admin = await prisma.user.create({
  data: {
    name: 'Admin',
    email: 'admin@ask-o.app',
    role: 'ADMIN',
    phone: '+237600000000',
    createdAt: new Date(),
    accounts: {
      create: {
        id: crypto.randomUUID(),
        accountId: 'admin-account',
        providerId: 'credential',
        password: adminPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  },
})

console.log('✅ Seed data inserted')

/*
async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'anjohsamuelr@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'anjohsamuelr@gmail.com',
      role: 'ADMIN',
    },
  })

  const submission = await prisma.contactSubmission.create({
    data: {
      name: 'Sample Client',
      email: 'anjoh.s.junior@gmail.com',
      message: 'Interested in your art services!',
      status: SubmissionStatus.new,
      assignedTo: { connect: { id: admin.id } },
    },
  })

  await prisma.auditLog.create({
    data: {
      contactSubmissionId: submission.id,
      action: 'Submission created',
      actorId: admin.id,
    },
  })

  console.log('✅ Seed data inserted')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
*/