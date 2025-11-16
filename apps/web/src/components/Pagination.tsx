'use client'

export default function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  return (
    <div className="flex justify-center gap-3 my-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="border px-3 py-1 rounded disabled:opacity-40"
      >
        Prev
      </button>

      <div className="px-3 py-1">
        {page} / {totalPages}
      </div>

      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="border px-3 py-1 rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
