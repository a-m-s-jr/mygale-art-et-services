/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Components } from 'react-markdown'
import { defaultSchema } from 'rehype-sanitize'

const baseTagNames = Array.isArray(defaultSchema.tagNames) ? defaultSchema.tagNames : []
const baseAttributes = defaultSchema.attributes ?? {}

export const markdownSanitizeSchema: any = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([
      ...baseTagNames,
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'code',
      'pre',
      'blockquote',
      'hr',
      'del',
      'kbd',
      'mark',
      'sup',
      'sub',
    ])
  ),
  attributes: {
    ...baseAttributes,
    a: [...(baseAttributes.a ?? []), 'href', 'title', 'rel', 'target'],
    img: [...(baseAttributes.img ?? []), 'src', 'alt', 'title'],
    code: [...(baseAttributes.code ?? []), 'className'],
    pre: [...(baseAttributes.pre ?? []), 'className'],
  },
}

export const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="mt-10 text-3xl font-bold tracking-tight text-neutral-900" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mt-8 text-2xl font-semibold tracking-tight text-neutral-900" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mt-6 text-xl font-semibold text-neutral-900" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-4 leading-7 text-neutral-700" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-[#003366] underline decoration-[#3399FF]/60 underline-offset-4" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mt-4 list-disc pl-6 text-neutral-700" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mt-4 list-decimal pl-6 text-neutral-700" {...props} />
  ),
  li: ({ node, ...props }) => <li className="mt-1" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mt-6 border-l-4 border-[#3399FF]/60 bg-[#F4F6F8] px-4 py-3 text-neutral-700"
      {...props}
    />
  ),
  code: ({ node, className, ...props }) => {
    const isInline = !className
    return (
      <code
        className={
          isInline
            ? 'rounded bg-neutral-100 px-1.5 py-0.5 text-[0.85em] text-neutral-900'
            : className
        }
        {...props}
      />
    )
  },
  pre: ({ node, ...props }) => (
    <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-neutral-100" {...props} />
  ),
  img: ({ node, ...props }) => (
    <img className="mt-6 rounded-lg border" {...props} alt={props.alt ?? ''} />
  ),
}
