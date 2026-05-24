'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const styles = {
    success: { bg: 'rgba(200,255,0,0.1)',   border: 'rgba(200,255,0,0.25)',   icon: '✓', color: '#C8FF00' },
    error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   icon: '✕', color: '#ef4444' },
    warning: { bg: 'rgba(255,149,0,0.1)',   border: 'rgba(255,149,0,0.25)',   icon: '!', color: '#FF9500' },
    info:    { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', icon: 'i', color: 'rgba(255,255,255,0.6)' },
  }[toast.type]

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#111111', border: `1px solid ${styles.border}`, borderRadius: '12px', padding: '0.875rem 1.125rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'toastIn 0.3s ease forwards', minWidth: '280px', maxWidth: '380px' }}>
      <div style={{ width: '26px', height: '26px', borderRadius: '8px', backgroundColor: styles.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', fontWeight: 900, color: styles.color }}>{styles.icon}</span>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', flex: 1, lineHeight: 1.4 }}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.1rem', flexShrink: 0, lineHeight: 1 }}>✕</button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', zIndex: 9999, pointerEvents: 'none' }}>
        <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(16px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }`}</style>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}