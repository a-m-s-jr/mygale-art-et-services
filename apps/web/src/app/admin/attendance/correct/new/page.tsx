import prisma from '@/lib/prisma'
import NewAttendanceForm from './NewAttendanceForm'

export default async function NewAttendancePage() {
  const employees = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  })

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Missing Attendance</h1>
        <p className="text-sm text-neutral-400">
          Use this only when an employee genuinely forgot to scan. The status is still calculated
          from the configured attendance window, and the correction is recorded with your name and
          the current time.
        </p>
      </div>

      <NewAttendanceForm employees={employees} />
    </div>
  )
}
