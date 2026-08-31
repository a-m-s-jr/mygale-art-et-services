import Link from 'next/link'
import prisma from '@/lib/prisma'
import { formatClockTime, formatCalendarDate, APP_TIMEZONE } from '@/lib/timezone'
import type { AttendanceStatus, Prisma } from '@prisma/client'

function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(new Date())
}

function buildHref(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value)
  }
  const s = qs.toString()
  return s ? `/admin/attendance?${s}` : '/admin/attendance'
}

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    departmentId?: string
    jobRoleId?: string
    status?: string
    from?: string
    to?: string
  }>
}) {
  const { q, departmentId, jobRoleId, status, from, to } = await searchParams
  const today = todayISO()
  const dateFrom = from || today
  const dateTo = to || today

  const where: Prisma.AttendanceWhereInput = {
    date: { gte: new Date(`${dateFrom}T00:00:00.000Z`), lte: new Date(`${dateTo}T00:00:00.000Z`) },
    ...(departmentId ? { departmentId } : {}),
    ...(jobRoleId ? { jobRoleId } : {}),
    ...(status ? { status: status as AttendanceStatus } : {}),
    ...(q
      ? {
          user: {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  }

  const [records, departments, jobRoles] = await Promise.all([
    prisma.attendance.findMany({
      where,
      orderBy: [{ date: 'desc' }, { arrivalAt: 'desc' }],
      take: 300,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    jobRoleId || departmentId
      ? prisma.jobRole.findMany({
          where: departmentId ? { departmentId } : undefined,
          orderBy: { name: 'asc' },
        })
      : prisma.jobRole.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-neutral-400">Daily arrivals across every department.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/attendance/config"
            className="rounded border border-neutral-700 px-3 py-1.5"
          >
            Configure Window
          </Link>
          <Link
            href="/admin/attendance/qr"
            className="rounded border border-neutral-700 px-3 py-1.5"
          >
            QR Code
          </Link>
        </div>
      </div>

      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 p-4"
        method="get"
      >
        <div>
          <label className="block text-xs text-neutral-400">Search</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Name or email"
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400">Department</label>
          <select
            name="departmentId"
            defaultValue={departmentId ?? ''}
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400">Role</label>
          <select
            name="jobRoleId"
            defaultValue={jobRoleId ?? ''}
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400">Status</label>
          <select
            name="status"
            defaultValue={status ?? ''}
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="ON_TIME">On time</option>
            <option value="LATE">Late</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400">From</label>
          <input
            type="date"
            name="from"
            defaultValue={dateFrom}
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400">To</label>
          <input
            type="date"
            name="to"
            defaultValue={dateTo}
            className="mt-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold">
          Filter
        </button>
        <Link href={buildHref({})} className="rounded border border-neutral-700 px-3 py-2 text-sm">
          Reset to today
        </Link>
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Arrival</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {records.map((r) => (
              <tr key={r.id} className="bg-neutral-950">
                <td className="px-4 py-3">
                  <div className="font-semibold">{r.user.name}</div>
                  <div className="text-xs text-neutral-400">{r.user.email}</div>
                </td>
                <td className="px-4 py-3 text-neutral-300">{r.departmentName ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-300">{r.jobRoleName ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                  {formatCalendarDate(r.date)}
                </td>
                <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                  {formatClockTime(r.arrivalAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      r.status === 'ON_TIME'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {r.status === 'ON_TIME' ? 'On time' : 'Late'}
                  </span>
                  {r.source === 'MANUAL' ? (
                    <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                      manual
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/attendance/correct/${r.id}`}
                    className="rounded border border-neutral-700 px-3 py-1 text-xs"
                  >
                    Correct
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">
            No attendance records match these filters.
          </div>
        ) : null}
      </div>

      <div className="text-sm">
        <Link
          href="/admin/attendance/correct/new"
          className="rounded border border-neutral-700 px-3 py-1.5"
        >
          Add missing attendance
        </Link>
      </div>
    </div>
  )
}
