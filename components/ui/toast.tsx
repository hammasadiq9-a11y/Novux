'use client'

import { createContext, useContext, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

/* ── Types ───────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info' | 'warn'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

/* ── Context ─────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

/* ── Config ──────────────────────────────────────────────────── */
const TOAST_CONFIG: Record<ToastType, { icon: string; color: string; bg: string; border: string }> = {
  success: { icon: '✓', color: '#C8FF00',  bg: 'rgba(200,255,0,0.06)',   border: 'rgba(200,255,0,0.2)'   },
  error:   { icon: '✕', color: '#ef4444',  bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  info:    { icon: '◈', color: '#60a5fa',  bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)'  },
  warn:    { icon: '!', color: '#FF9500',  bg: 'rgba(255,149,0,0.08)',   border: 'rgba(255,149,0,0.2)'   },
}

/* ── Single Toast Item ───────────────────────────────────────── */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const cfg = TOAST_CONFIG[toast.type]

  // Entrance animation
  const nodeRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    gsap.fromTo(
      node,
      { opacity: 0, y: 16, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
    )
  }, [])

  const dismiss = () => {
    if (!ref.current) return
    gsap.to(ref.current, {
      opacity: 0, y: -8, scale: 0.96, duration: 0.25, ease: 'power2.in',
      onComplete: () => onRemove(toast.id),
    })
  }

  return (
    <div
      ref={(node) => {
        // @ts-expect-error – dual ref
        ref.current = node
        nodeRef(node)
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        backgroundColor: '#111111',
        border: `1px solid ${cfg.border}`,
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        minWidth: '260px', maxWidth: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '8px',
        backgroundColor: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', fontWeight: 900, color: cfg.color }}>
          {cfg.icon}
        </span>
      </div>

      {/* Message */}
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.845rem',
        color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, flex: 1,
      }}>
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
          cursor: 'pointer', fontSize: '0.85rem', padding: '0.1rem',
          lineHeight: 1, flexShrink: 0, transition: 'color 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
      >
        ✕
      </button>
    </div>
  )
}

/* ── Provider ────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev.slice(-4), { id, message, type }]) // max 5 at once

    const timer = setTimeout(() => {
      // Trigger exit animation via the component's own dismiss
      setToasts(prev => {
        const item = prev.find(t => t.id === id)
        if (!item) return prev
        // Just remove after auto-timeout (no exit anim needed for auto)
        return prev.filter(t => t.id !== id)
      })
      timers.current.delete(id)
    }, 3500)

    timers.current.set(id, timer)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* ── Toast Stack ── */}
      <div
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.625rem',
          zIndex: 9999, pointerEvents: 'none',
          alignItems: 'flex-end',
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}