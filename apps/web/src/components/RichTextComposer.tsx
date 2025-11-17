// apps/web/src/components/RichTextComposer.tsx
'use client'
import React from 'react'

export default function RichTextComposer({
  value,
  onChange,
  placeholder = 'Write your reply...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-3 bg-neutral-800 border border-neutral-700 rounded resize-y"
      />
      <div className="mt-2 text-xs text-gray-400">Supports basic HTML — sanitized server-side.</div>
    </div>
  )
}
