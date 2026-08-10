import Link from 'next/link'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { deleteRedirect, toggleRedirectActive } from './actions'

export default async function AdminRedirectsPage() {
  await requireRole('ADMIN')
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Redirects</h1>
          <p className="text-sm text-neutral-400">
            Manage URL redirects. One is created automatically whenever a service&apos;s slug
            changes.
          </p>
        </div>
        <Link
          href="/admin/redirects/new"
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold"
        >
          New Redirect
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {redirects.map((r) => (
              <tr key={r.id} className="bg-neutral-950">
                <td className="px-4 py-3 text-neutral-300">{r.fromPath}</td>
                <td className="px-4 py-3 text-neutral-300">{r.toPath}</td>
                <td className="px-4 py-3 text-neutral-300">{r.statusCode}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      r.active
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-neutral-700/40 text-neutral-300'
                    }`}
                  >
                    {r.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/redirects/${r.id}/edit`}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs"
                    >
                      Edit
                    </Link>

                    <form action={toggleRedirectActive}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="active" value={(!r.active).toString()} />
                      <button
                        type="submit"
                        className="rounded border border-neutral-700 px-3 py-1 text-xs"
                      >
                        {r.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>

                    <form action={deleteRedirect}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-500/60 px-3 py-1 text-xs text-red-200"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {redirects.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No redirects yet.</div>
        ) : null}
      </div>
    </div>
  )
}
