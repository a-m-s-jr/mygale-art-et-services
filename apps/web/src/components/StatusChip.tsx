export default function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    responded: 'bg-green-100 text-green-800',
    closed: 'bg-gray-200 text-gray-700',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
