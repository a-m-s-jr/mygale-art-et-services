'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'
import { recordCheckIn } from '@/lib/attendance'
import { getLocale } from '@/lib/getLocale'

type ActionState = {
  error?: string
  result?: { arrivalAt: string; status: 'ON_TIME' | 'LATE'; alreadyRecorded: boolean }
}

const ERROR_MESSAGES = {
  inactive_account: {
    fr: 'Votre compte est inactif. Contactez un administrateur.',
    en: 'Your account is not active. Contact an administrator.',
  },
} as const

export async function checkInAttendance(_prevState: ActionState): Promise<ActionState> {
  const user = await requireRole('USER')

  const result = await recordCheckIn(user.id)

  if (result.outcome === 'error') {
    const locale = await getLocale()
    return { error: ERROR_MESSAGES[result.code][locale] }
  }

  revalidatePath('/admin/my-attendance')

  return {
    result: {
      arrivalAt: result.arrivalAt.toISOString(),
      status: result.status,
      alreadyRecorded: result.outcome === 'already_recorded',
    },
  }
}
