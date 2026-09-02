import prisma from '@/lib/prisma'
import { getAdminT } from '@/lib/getLocale'
import NewAttendanceForm from './NewAttendanceForm'

export default async function NewAttendancePage() {
  const [employees, adminT] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    getAdminT(),
  ])
  const t = adminT.attendanceCorrect

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.addTitle}</h1>
        <p className="text-sm text-neutral-400">{t.addSubtitle}</p>
      </div>

      <NewAttendanceForm employees={employees} />
    </div>
  )
}
