import prisma from '@/lib/prisma'
import { DEFAULT_WINDOW_START_MINUTES, DEFAULT_WINDOW_END_MINUTES } from '@/lib/attendance'
import { formatMinutesAsTime } from '@/lib/timezone'
import WindowForm from './WindowForm'

export default async function AttendanceConfigPage() {
  const [departments, windows] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.attendanceWindow.findMany(),
  ])

  const windowByDepartmentId = new Map(
    windows.filter((w) => w.departmentId).map((w) => [w.departmentId as string, w]),
  )
  const defaultWindow = windows.find((w) => w.departmentId === null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance Window</h1>
        <p className="text-sm text-neutral-400">
          Employees arriving before or during this period are considered ON TIME. Employees arriving
          after the end time are considered LATE. Each department can override the default window
          below.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
        <div className="text-sm font-semibold">
          Default window (all departments without their own)
        </div>
        <WindowForm
          departmentId={null}
          windowStart={formatMinutesAsTime(
            defaultWindow?.windowStartMinutes ?? DEFAULT_WINDOW_START_MINUTES,
          )}
          windowEnd={formatMinutesAsTime(
            defaultWindow?.windowEndMinutes ?? DEFAULT_WINDOW_END_MINUTES,
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Department overrides
        </div>
        {departments.map((dept) => {
          const w = windowByDepartmentId.get(dept.id)
          return (
            <div key={dept.id} className="rounded-xl border border-neutral-800 p-4 space-y-2">
              <div className="text-sm font-semibold">{dept.name}</div>
              {!w ? (
                <p className="text-xs text-neutral-500">
                  Currently using the default window above.
                </p>
              ) : null}
              <WindowForm
                departmentId={dept.id}
                windowStart={formatMinutesAsTime(
                  w?.windowStartMinutes ??
                    defaultWindow?.windowStartMinutes ??
                    DEFAULT_WINDOW_START_MINUTES,
                )}
                windowEnd={formatMinutesAsTime(
                  w?.windowEndMinutes ??
                    defaultWindow?.windowEndMinutes ??
                    DEFAULT_WINDOW_END_MINUTES,
                )}
              />
            </div>
          )
        })}
        {departments.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No departments yet — add one from the Departments page to set a department-specific
            window.
          </p>
        ) : null}
      </div>
    </div>
  )
}
