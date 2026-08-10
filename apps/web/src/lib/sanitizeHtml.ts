import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

/**
 * Sanitizes rich-text HTML (from the Tiptap editor) before it's stored.
 * Uses the same rehype-sanitize allowlist family already relied on for
 * Markdown rendering elsewhere in the app.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const file = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .processSync(html)
  return String(file)
}
