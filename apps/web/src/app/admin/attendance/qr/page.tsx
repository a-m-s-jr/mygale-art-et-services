import { generateAttendanceQrDataUrl, getAttendanceCheckInUrl } from '@/lib/attendanceQr'
import { getAdminT } from '@/lib/getLocale'

export default async function AttendanceQrPage() {
  const [qrDataUrl, adminT] = await Promise.all([generateAttendanceQrDataUrl(), getAdminT()])
  const url = getAttendanceCheckInUrl()
  const t = adminT.attendanceQr

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-400">{t.body}</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-800 bg-white p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Attendance check-in QR code" width={320} height={320} />
      </div>

      <p className="break-all text-center text-xs text-neutral-500">{url}</p>
    </div>
  )
}
