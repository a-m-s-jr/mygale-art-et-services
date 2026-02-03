import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          href="/admin/products"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold mb-2">Products & Services</h3>
          <p className="text-sm text-gray-600">
            Manage your products and services catalog
          </p>
        </Link>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="text-gray-600 mb-4">
          You have successfully accessed the admin area.
        </p>
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Logged in as: <strong>{session?.user?.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Role: <strong>{session?.user?.role}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
