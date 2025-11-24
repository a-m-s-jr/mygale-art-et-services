import React from 'react'

export default function Pagination({
  page,
  onPage,
}: {
  page: number
  onPage: (p: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        className="px-3 py-1 bg-neutral-800 rounded"
      >
        Prev
      </button>
      <div className="px-3 py-1 bg-neutral-900 rounded">Page {page}</div>
      <button onClick={() => onPage(page + 1)} className="px-3 py-1 bg-neutral-800 rounded">
        Next
      </button>
    </div>
  )
}
