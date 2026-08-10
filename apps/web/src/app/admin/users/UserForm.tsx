'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createUser, updateUser } from './actions'

const initialState = { error: '' as string | undefined }

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF', 'VIEWER', 'USER'] as const

type UserFormData = {
  id?: string
  name: string
  email: string
  role: (typeof ALL_ROLES)[number]
  active: boolean
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving...' : label}
    </button>
  )
}

export default function UserForm({
  mode,
  initial,
  canGrantAdmin,
  isSelf,
}: {
  mode: 'create' | 'edit'
  initial?: UserFormData
  canGrantAdmin: boolean
  isSelf?: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [role, setRole] = useState<UserFormData['role']>(initial?.role ?? 'EDITOR')
  const [active, setActive] = useState(initial?.active ?? true)
  const [password, setPassword] = useState('')

  const action = mode === 'create' ? createUser : updateUser
  const [state, formAction] = useActionState(action, initialState)

  const availableRoles = ALL_ROLES.filter(
    (r) => canGrantAdmin || (r !== 'SUPER_ADMIN' && r !== 'ADMIN'),
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      {mode === 'edit' && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-neutral-300">Name *</label>
          <input
            name="name"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Email *</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 disabled:opacity-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={mode === 'edit'}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">
            {mode === 'create' ? 'Password *' : 'New password (leave blank to keep current)'}
          </label>
          <input
            name="password"
            type="password"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={mode === 'create'}
            minLength={8}
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Role *</label>
          <select
            name="role"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 disabled:opacity-50"
            value={role}
            onChange={(e) => setRole(e.target.value as UserFormData['role'])}
            disabled={isSelf}
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {!canGrantAdmin ? (
            <p className="mt-1 text-xs text-neutral-500">
              Only a Super Admin can grant Admin or Super Admin.
            </p>
          ) : null}
        </div>
      </div>

      {mode === 'edit' ? (
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            name="active"
            className="h-4 w-4"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={isSelf}
          />
          Active (unchecking immediately signs this user out everywhere)
        </label>
      ) : null}

      <SubmitButton label={mode === 'create' ? 'Create User' : 'Save Changes'} />
    </form>
  )
}
