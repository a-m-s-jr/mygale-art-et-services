import QRCode from 'qrcode'

/**
 * The QR code is a single general attendance code, not tied to any
 * department or individual employee — it simply links to the attendance
 * page. Whoever is authenticated when it's scanned is whose attendance gets
 * recorded, so there's nothing secret to encode and no rotation to manage.
 */
export function getAttendanceCheckInUrl(): string {
  const base = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/admin/my-attendance`
}

export async function generateAttendanceQrDataUrl(): Promise<string> {
  return QRCode.toDataURL(getAttendanceCheckInUrl(), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 480,
  })
}
