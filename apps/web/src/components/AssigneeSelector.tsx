'use client'
import React, { useEffect, useState } from 'react'

type User = { id: string; name: string }

export default function AssigneeSelector({
  token,
  submissionId,
  initialAssignee,
}: {
  token: string
  submissionId: string
  initialAssignee: string | null
}) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState(initialAssignee || '')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/users?role=staff`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [token])

  async function assign(newUserId: string) {
    setValue(newUserId)
    await fetch(`/api/contact-submissions/${submissionId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: newUserId }),
    })
  }

  if (loading) return <div className="text-sm">Loading staff…</div>

  return (
    <select
      value={value}
      onChange={(e) => assign(e.target.value)}
      className="border px-2 py-1 rounded"
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  )
}
