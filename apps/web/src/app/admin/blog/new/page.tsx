import BlogPostForm from '../BlogPostForm'

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Blog Post</h1>
        <p className="text-sm text-neutral-400">Draft a new post and publish when ready.</p>
      </div>
      <BlogPostForm mode="create" />
    </div>
  )
}
