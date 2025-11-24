'use client'
import React, { createContext, useContext, useState } from 'react'

type Toast = { id: string; title: string; tone?: 'info' | 'success' | 'error' }

const ToastCtx = createContext<{ push: (t: string, tone?: Toast['tone']) => void } | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  function push(title: string, tone: Toast['tone'] = 'info') {
    const t = { id: String(Date.now()), title, tone }
    setToasts((s) => [...s, t])
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4000)
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="p-3 rounded bg-neutral-800 border border-neutral-700 text-sm">
            {t.title}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
