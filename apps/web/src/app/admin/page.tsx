import Link from 'next/link'

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage blog posts and global announcements.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/blog" className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="text-lg font-semibold">Blog</div>
          <p className="text-sm text-neutral-400 mt-2">Create, edit, and publish blog posts.</p>
        </Link>

        <Link
          href="/admin/announcements"
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div className="text-lg font-semibold">Announcements</div>
          <p className="text-sm text-neutral-400 mt-2">
            Schedule and manage announcement banners.
          </p>
        </Link>
      </div>
    </div>
  )
}
