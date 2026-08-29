import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { calendarDate, formatClockTime } from '@/lib/timezone'
import CheckInPanel from './CheckInPanel'

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
        {today ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              today.status === 'ON_TIME'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            }`}
          >
            <p className="font-semibold">Today&apos;s attendance is recorded.</p>
            <p className="mt-1">Arrival: {formatClockTime(today.arrivalAt)}</p>
            <p>Status: {today.status === 'ON_TIME' ? 'ON TIME' : 'LATE'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              You haven&apos;t checked in today. Scan the attendance QR code at the entrance, or tap
              the button below if you followed a link from it.
            </p>
            <CheckInPanel />
          </div>
        )}
      </div>
    </div>
  )
}
