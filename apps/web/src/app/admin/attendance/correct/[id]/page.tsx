import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatClockTime, formatCalendarDate } from '@/lib/timezone'
import CorrectForm from '../CorrectForm'

export default async function CorrectAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const record = await prisma.attendance.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      correctedBy: { select: { name: true } },
    },
  })
  if (!record) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Correct Attendance</h1>
        <p className="text-sm text-neutral-400">
          {record.user.name} ({record.user.email}) · {formatCalendarDate(record.date)} ·{' '}
          {record.departmentName ?? 'No department'}
          {record.jobRoleName ? ` · ${record.jobRoleName}` : ''}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Current arrival: {formatClockTime(record.arrivalAt)} (
          {record.status === 'ON_TIME' ? 'On time' : 'Late'})
          {record.correctedBy ? ` · last corrected by ${record.correctedBy.name}` : ''}
        </p>
      </div>

      <CorrectForm id={record.id} arrivalTime={formatClockTime(record.arrivalAt)} />
    </div>
  )
}
