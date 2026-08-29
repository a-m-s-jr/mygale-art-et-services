'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createUser, updateUser } from './actions'
import { ADMIN_PAGES } from '@/lib/adminPages'

const initialState = { error: '' as string | undefined }

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF', 'VIEWER', 'USER'] as const

type UserFormData = {
  id?: string
  name: string
  email: string
  role: (typeof ALL_ROLES)[number]
  active: boolean
  pagesRestricted: boolean
  allowedPages: string[]
  departmentId?: string | null
  jobRoleId?: string | null
}

type DepartmentOption = { id: string; name: string; jobRoles: { id: string; name: string }[] }

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
  departments,
}: {
  mode: 'create' | 'edit'
  initial?: UserFormData
  canGrantAdmin: boolean
  isSelf?: boolean
  departments: DepartmentOption[]
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [role, setRole] = useState<UserFormData['role']>(initial?.role ?? 'EDITOR')
  const [active, setActive] = useState(initial?.active ?? true)
  const [password, setPassword] = useState('')
  const [pagesRestricted, setPagesRestricted] = useState(initial?.pagesRestricted ?? false)
  const [allowedPages, setAllowedPages] = useState<string[]>(
    initial?.allowedPages ?? ADMIN_PAGES.map((p) => p.key),
  )
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? '')
  const [jobRoleId, setJobRoleId] = useState(initial?.jobRoleId ?? '')
  const jobRolesForDepartment = departments.find((d) => d.id === departmentId)?.jobRoles ?? []

  const action = mode === 'create' ? createUser : updateUser
  const [state, formAction] = useActionState(action, initialState)

  const availableRoles = ALL_ROLES.filter(
    (r) => canGrantAdmin || (r !== 'SUPER_ADMIN' && r !== 'ADMIN'),
  )
  const isAdminRole = role === 'SUPER_ADMIN' || role === 'ADMIN'

  function toggleAllowedPage(key: string) {
    setAllowedPages((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

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
        <div>
          <label className="text-sm text-neutral-300">Department</label>
          <select
            name="departmentId"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value)
              setJobRoleId('')
            }}
          >
            <option value="">No department (not an attendance employee)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-neutral-300">Job Role</label>
          <select
            name="jobRoleId"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 disabled:opacity-50"
            value={jobRoleId}
            onChange={(e) => setJobRoleId(e.target.value)}
            disabled={!departmentId}
          >
            <option value="">No job role</option>
            {jobRolesForDepartment.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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

      <div className="space-y-3 rounded-lg border border-neutral-800 p-4">
        <div className="text-sm font-semibold text-neutral-200">Admin page access</div>

        {isAdminRole ? (
          <p className="text-sm text-neutral-400">
            {role === 'SUPER_ADMIN' ? 'Super Admins' : 'Admins'} always have full access to every
            admin page — this can&apos;t be restricted.
          </p>
        ) : (
          <>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                name="pagesRestricted"
                className="h-4 w-4"
                checked={pagesRestricted}
                onChange={(e) => setPagesRestricted(e.target.checked)}
              />
              Restrict this account to specific admin pages
            </label>

            {pagesRestricted ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {ADMIN_PAGES.map((page) => {
                  // Admin-tier pages (Users, Settings, Navigation, ...) stay
                  // off-limits below Admin rank no matter what's granted —
                  // mirrors the server-side check in hasPageAccess().
                  const reachable = page.minRole !== 'ADMIN'
                  return (
                    <label
                      key={page.key}
                      className={`flex items-center gap-2 text-sm ${
                        reachable ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="allowedPages"
                        value={page.key}
                        className="h-4 w-4"
                        checked={allowedPages.includes(page.key)}
                        onChange={() => toggleAllowedPage(page.key)}
                        disabled={!reachable}
                      />
                      {page.label}
                      {!reachable ? (
                        <span className="text-xs text-neutral-600">(Admin only)</span>
                      ) : null}
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Full access to every page this role&apos;s rank permits. Check the box above to pick
                specific pages instead — this can grant a page below the account&apos;s usual rank
                (e.g. Blog to a Staff account), but never an Admin-only page.
              </p>
            )}
          </>
        )}
      </div>

      <SubmitButton label={mode === 'create' ? 'Create User' : 'Save Changes'} />
    </form>
  )
}
