import prisma from '@/lib/prisma'
import { createBlogCategory, deleteBlogCategory } from './actions'

export default async function AdminBlogCategoriesPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog Categories</h1>
        <p className="text-sm text-neutral-400">Organize blog posts into categories.</p>
      </div>

      <form
        action={createBlogCategory}
        className="grid gap-3 rounded-xl border border-neutral-800 p-4 md:grid-cols-3"
      >
        <input
          name="nameFr"
          placeholder="Name (FR) *"
          required
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
        />
        <input
          name="nameEn"
          placeholder="Name (EN) *"
          required
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold">
          Add Category
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {categories.map((c) => (
              <tr key={c.id} className="bg-neutral-950">
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.nameFr}</div>
                  <div className="text-xs text-neutral-400">{c.nameEn}</div>
                </td>
                <td className="px-4 py-3 text-neutral-300">{c.slug}</td>
                <td className="px-4 py-3 text-neutral-300">{c._count.posts}</td>
                <td className="px-4 py-3">
                  <form action={deleteBlogCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-500/60 px-3 py-1 text-xs text-red-200"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No categories yet.</div>
        ) : null}
      </div>
    </div>
  )
}
