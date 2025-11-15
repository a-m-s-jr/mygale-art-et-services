/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/web/src/components/ToastProvider.tsx
'use client'
import React, { createContext, useContext, useState } from 'react'
import clsx from 'clsx'

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' }
const ToastContext = createContext(null as any)

export const useToast = () => useContext(ToastContext)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function push(message: string, type: Toast['type'] = 'info') {
    const t = { id: String(Date.now()) + Math.random().toString(36).slice(2), message, type }
    setToasts((s) => [t, ...s])
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 5000)
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'px-4 py-2 rounded shadow text-sm max-w-xs',
              t.type === 'success'
                ? 'bg-green-50 text-green-800'
                : t.type === 'error'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-white text-gray-800',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
