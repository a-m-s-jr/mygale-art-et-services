/**
 * Single source of truth for the timezone Mygale Art et Services operates in
 * (Douala, Cameroon — UTC+1 year-round, no DST). Attendance dates/windows are
 * always computed against this timezone rather than the host server's local
 * time, so behavior stays consistent regardless of where the app is deployed.
 */
export const APP_TIMEZONE = 'Africa/Douala'

/** Minutes since local midnight (0-1439) for `instant`, in APP_TIMEZONE. */
export function minutesOfDay(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

/** The calendar date (as a UTC-midnight Date, for @db.Date columns) that `instant` falls on in APP_TIMEZONE. */
export function calendarDate(instant: Date): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  return new Date(Date.UTC(year, month - 1, day))
}

/** Formats "HH:mm" (24h) from minutes-of-day, for display and form defaults. */
export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Parses "HH:mm" into minutes-of-day, or null if malformed/out of range. */
export function parseTimeToMinutes(value: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/** Formats an instant as a localized "HH:mm" clock time in APP_TIMEZONE. */
export function formatClockTime(instant: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(instant)
}

/** Formats an instant as a localized date + time in APP_TIMEZONE, for tables/logs. */
export function formatDateTime(instant: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(instant)
}

/**
 * Combines a "YYYY-MM-DD" date and "HH:mm" time, both understood as local
 * APP_TIMEZONE clock values, into the UTC instant they represent. Used for
 * manual attendance corrections, where an admin enters a wall-clock arrival
 * time for a specific day. Africa/Douala has no DST, so the offset is fixed.
 */
export function zonedTimeToInstant(dateStr: string, timeStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  const minutes = parseTimeToMinutes(timeStr)
  if (minutes === null) return null
  const instant = new Date(`${dateStr}T${formatMinutesAsTime(minutes)}:00+01:00`)
  return Number.isNaN(instant.getTime()) ? null : instant
}

/** Formats a @db.Date value (stored at UTC midnight) as a plain date with its weekday, ignoring any local-tz shift. */
export function formatCalendarDate(date: Date): string {
  // dateStyle can't be combined with explicit fields like weekday (Intl
  // throws), so the "medium" look (e.g. "Sep 4, 2026") is spelled out by
  // hand here with weekday prepended: "Fri, Sep 4, 2026".
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
