import React from 'react'

export default function StatusChip({ status }: { status?: string }) {
  const s = status ?? 'new'
  const map: Record<string, string> = {
    new: 'bg-amber-500 text-neutral-900',
    in_review: 'bg-yellow-400 text-neutral-900',
    responded: 'bg-green-500 text-neutral-900',
    closed: 'bg-gray-600 text-white',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs ${map[s] ?? 'bg-gray-600'}`}>
      {s.replace('_', ' ')}
    </span>
  )
}
