'use client'
import React, { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

export default function RichTextComposer({
  value,
  onChange,
  placeholder,
  autosaveKey,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  autosaveKey?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    // initialize contentEditable
    if (value) {
      ref.current.innerHTML = value
    } else {
      // if no value, try load from localStorage
      try {
        const key = autosaveKey
        if (key) {
          const saved = localStorage.getItem(key)
          if (saved) ref.current.innerHTML = saved
        }
      } catch {}
    }
  }, [value, autosaveKey])

  useEffect(() => {
    if (!autosaveKey) return
    const timer = setInterval(() => {
      if (!ref.current) return
      try {
        localStorage.setItem(autosaveKey, ref.current.innerHTML)
      } catch {}
    }, 3000)
    return () => clearInterval(timer)
  }, [autosaveKey])

  function handleInput() {
    if (!ref.current) return
    const raw = ref.current.innerHTML
    // sanitize before sending up
    const safe = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
    onChange(safe)
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        className="min-h-[120px] border p-3 rounded prose max-w-none"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        aria-multiline
      />
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}
