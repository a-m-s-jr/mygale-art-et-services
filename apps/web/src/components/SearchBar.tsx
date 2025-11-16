'use client'

export default function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (s: string) => void
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search name, email, message…"
      className="border px-3 py-2 rounded w-full mb-4"
    />
  )
}
