import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { calendarDate } from '@/lib/timezone'
import AttendancePanel from './AttendancePanel'

export default async function MyAttendancePage() {
  const user = await requireRole('USER')

  const [today, department, jobRole] = await Promise.all([
    prisma.attendance.findUnique({
      where: { userId_date: { userId: user.id, date: calendarDate(new Date()) } },
    }),
    user.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId } }) : null,
    user.jobRoleId ? prisma.jobRole.findUnique({ where: { id: user.jobRoleId } }) : null,
  ])

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Attendance</h1>
        <p className="text-sm text-neutral-400">
          {user.name} · {department?.name ?? 'No department assigned'}
          {jobRole ? ` · ${jobRole.name}` : ''}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <AttendancePanel
          initialRecord={
            today ? { arrivalAt: today.arrivalAt.toISOString(), status: today.status } : null
          }
        />
      </div>
    </div>
  )
}
