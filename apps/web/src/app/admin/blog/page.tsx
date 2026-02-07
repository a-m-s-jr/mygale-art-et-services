import Link from 'next/link'
import prisma from '@/lib/prisma'
import { deleteBlogPost, toggleBlogPostPublish } from './actions'

function formatDate(value: Date | null) {
  if (!value) return '--'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(value)
}

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ createdAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts</h1>
          <p className="text-sm text-neutral-400">Manage, publish, and update posts.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold"
        >
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {posts.map((post) => (
              <tr key={post.id} className="bg-neutral-950">
                <td className="px-4 py-3">
                  <div className="font-semibold">{post.title}</div>
                  <div className="text-xs text-neutral-400">{post.slug}</div>
                </td>
                <td className="px-4 py-3 uppercase text-xs text-neutral-300">{post.locale}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      post.published
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-300">{formatDate(post.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="rounded border border-neutral-700 px-3 py-1 text-xs"
                    >
                      Edit
                    </Link>

                    <form action={toggleBlogPostPublish}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="published" value={(!post.published).toString()} />
                      <button
                        type="submit"
                        className="rounded border border-neutral-700 px-3 py-1 text-xs"
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>

                    <form action={deleteBlogPost}>
                      <input type="hidden" name="id" value={post.id} />
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
        {posts.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No blog posts yet.</div>
        ) : null}
      </div>
    </div>
  )
}
