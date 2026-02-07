import AnnouncementForm from '../AnnouncementForm'

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Announcement</h1>
        <p className="text-sm text-neutral-400">Publish a new global banner message.</p>
      </div>
      <AnnouncementForm mode="create" />
    </div>
  )
}
