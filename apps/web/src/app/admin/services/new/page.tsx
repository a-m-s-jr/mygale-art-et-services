import ServiceForm from '../ServiceForm'

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Service</h1>
        <p className="text-sm text-neutral-400">Add a new service page with FR/EN content.</p>
      </div>
      <ServiceForm mode="create" />
    </div>
  )
}
