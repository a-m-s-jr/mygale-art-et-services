'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'
import { recordCheckIn } from '@/lib/attendance'

type ActionState = {
  error?: string
  result?: { arrivalAt: string; status: 'ON_TIME' | 'LATE'; alreadyRecorded: boolean }
}

export async function checkInAttendance(_prevState: ActionState): Promise<ActionState> {
  const user = await requireRole('USER')

  const result = await recordCheckIn(user.id)

  if (result.outcome === 'error') {
    return { error: result.message }
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
