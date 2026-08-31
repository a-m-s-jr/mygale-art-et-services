import { generateAttendanceQrDataUrl, getAttendanceCheckInUrl } from '@/lib/attendanceQr'

export default async function AttendanceQrPage() {
  const qrDataUrl = await generateAttendanceQrDataUrl()
  const url = getAttendanceCheckInUrl()

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance QR Code</h1>
        <p className="text-sm text-neutral-400">
          Print and display this at the entrance. Any logged-in employee who scans it is taken to
          their own attendance page — the code itself doesn&apos;t identify anyone, so the same code
          works for every department and role.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-800 bg-white p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Attendance check-in QR code" width={320} height={320} />
      </div>

      <p className="break-all text-center text-xs text-neutral-500">{url}</p>
    </div>
  )
}
