/**
 * Escapes plain-text user input for safe interpolation into HTML (e.g. email
 * notification bodies). This is NOT for rich text — use `sanitizeHtml` for
 * that. This is for cases where the value is expected to be plain text but
 * gets dropped into an HTML template string.
 */
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
