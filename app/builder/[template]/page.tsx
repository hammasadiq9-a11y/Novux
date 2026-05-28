'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

/* ── Types ───────────────────────────────────────────────────── */
type Device = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: '100%',
  tablet:  '768px',
  mobile:  '390px',
}

/* ── Magnetic Button ─────────────────────────────────────────── */
function MagneticBtn({
  children, onClick, disabled = false, variant = 'accent', fullWidth = false, size = 'md',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'accent' | 'ghost' | 'danger'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.3, ease: 'power2.out' })
  }
  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
    ref.current.style.boxShadow = 'none'
    if (variant === 'ghost') ref.current.style.backgroundColor = 'transparent'
  }
  const onEnter = () => {
    if (!ref.current || disabled) return
    if (variant === 'accent') ref.current.style.boxShadow = '0 0 28px rgba(200,255,0,0.35)'
    else if (variant === 'ghost') ref.current.style.backgroundColor = 'rgba(255,255,255,0.06)'
  }

  const pad = size === 'lg' ? '0.875rem 2rem' : size === 'sm' ? '0.375rem 0.875rem' : '0.65rem 1.5rem'
  const fs  = size === 'lg' ? '1rem' : size === 'sm' ? '0.78rem' : '0.875rem'
  const variantStyle: React.CSSProperties =
    variant === 'accent' ? { backgroundColor: '#C8FF00', color: '#000000' } :
    variant === 'danger'  ? { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } :
    { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <button ref={ref} onClick={disabled ? undefined : onClick}
      onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: fs, letterSpacing: '-0.01em', border: 'none', borderRadius: '10px', padding: pad, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, willChange: 'transform', transition: 'box-shadow 250ms, background-color 200ms', width: fullWidth ? '100%' : undefined, ...variantStyle }}>
      {children}
    </button>
  )
}

/* ── Step Panel ──────────────────────────────────────────────── */
function StepPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
  }, [])
  return <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>{children}</div>
}

/* ── Progress Bar ────────────────────────────────────────────── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!barRef.current) return
    gsap.to(barRef.current, { width: `${(current / total) * 100}%`, duration: 0.5, ease: 'power2.out' })
  }, [current, total])
  return (
    <div style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '2rem' }}>
      <div ref={barRef} style={{ height: '100%', backgroundColor: '#C8FF00', width: '0%', borderRadius: '99px' }} />
    </div>
  )
}

/* ── Select Card ─────────────────────────────────────────────── */
function SelectCard({ label, emoji, active, onClick }: {
  label: string; emoji: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.875rem 1.25rem', borderRadius: '12px', cursor: 'pointer',
        border: `1px solid ${active ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`,
        backgroundColor: active ? 'rgba(200,255,0,0.07)' : '#111111',
        color: active ? '#C8FF00' : 'rgba(255,255,255,0.6)',
        fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 500,
        transition: 'all 200ms', textAlign: 'left', width: '100%',
        boxShadow: active ? '0 0 16px rgba(200,255,0,0.08)' : 'none',
      }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{emoji}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <span style={{
          width: '18px', height: '18px', borderRadius: '50%',
          backgroundColor: '#C8FF00', color: '#000', fontSize: '0.65rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, flexShrink: 0,
        }}>✓</span>
      )}
    </button>
  )
}

/* ── Loading Step ────────────────────────────────────────────── */
function LoadingStep({ count }: { count: number }) {
  const dotsRef = useRef<HTMLDivElement[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const lines   = ['✦ Designing 3 unique layouts', '✦ Writing custom copy', '✦ Crafting animations', '✦ Optimizing for performance']

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current.children, { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.18, delay: 0.4, duration: 0.4, ease: 'power2.out' })
    }
    dotsRef.current.forEach((dot, i) => {
      if (!dot) return
      gsap.to(dot, { scale: 1.4, opacity: 0.4, repeat: -1, yoyo: true, duration: 0.6, delay: i * 0.15, ease: 'sine.inOut' })
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8rem 0', gap: '2.5rem' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', borderTop: '2px solid #C8FF00', borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} ref={(el) => { if (el) dotsRef.current[i] = el }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i < count ? '#C8FF00' : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Building 3 variations
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
          {count === 0 ? 'Generating your sites…' : `${count} of 3 ready…`}
        </p>
      </div>
      <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center' }}>
        {lines.map((l) => <p key={l} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem', opacity: 0 }}>{l}</p>)}
      </div>
    </div>
  )
}

/* ── Variation Picker ────────────────────────────────────────── */
function VariationPicker({ variations, onPick, onRegenerate }: {
  variations: string[]
  onPick: (html: string) => void
  onRegenerate: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current.children, { opacity: 0, y: 32 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.55, ease: 'power3.out' })
  }, [])

  const SCALE       = 0.22
  const IFRAME_W    = 1280
  const IFRAME_H    = 900
  const CONTAINER_W = IFRAME_W * SCALE
  const CONTAINER_H = IFRAME_H * SCALE

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', padding: '4rem 2rem 8rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>3 Variations Ready</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
            Pick your favourite.
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
            Each one is completely unique. Choose one to open in the full editor.
          </p>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {variations.map((html, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ backgroundColor: '#111111', border: `1px solid ${hovered === i ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', overflow: 'hidden', transition: 'border-color 250ms, transform 300ms', transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)', cursor: 'pointer' }}
              onClick={() => onPick(html)}>
              <div style={{ backgroundColor: '#0f0f0f', padding: '0.6rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.4)' }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'rgba(234,179,8,0.4)' }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.4)' }} />
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '0.15rem 0.5rem', marginLeft: '0.375rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>variation {i + 1}</span>
                </div>
              </div>
              <div style={{ width: '100%', height: `${CONTAINER_H}px`, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
                <div style={{ width: `${CONTAINER_W}px`, height: `${CONTAINER_H}px`, overflow: 'hidden', margin: '0 auto' }}>
                  <iframe
                    srcDoc={html}
                    style={{ width: `${IFRAME_W}px`, height: `${IFRAME_H}px`, border: 'none', transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                    title={`Variation ${i + 1}`}
                  />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: hovered === i ? 'rgba(200,255,0,0.06)' : 'transparent', transition: 'background 250ms', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hovered === i && (
                    <div style={{ backgroundColor: '#C8FF00', color: '#000', fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '0.875rem', padding: '0.6rem 1.5rem', borderRadius: '99px' }}>
                      Choose this one →
                    </div>
                  )}
                </div>
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>Variation {i + 1}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Unique layout & style</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onPick(html) }}
                  style={{ backgroundColor: hovered === i ? '#C8FF00' : 'rgba(200,255,0,0.1)', color: hovered === i ? '#000' : '#C8FF00', border: 'none', borderRadius: '8px', padding: '0.4rem 1rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 200ms, color 200ms' }}>
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onRegenerate}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', padding: '0.65rem 1.5rem', cursor: 'pointer', transition: 'color 200ms, border-color 200ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
            ↺ Not happy? Regenerate all 3
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Device Toggle Button ────────────────────────────────────── */
function DeviceBtn({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 200ms, color 200ms', backgroundColor: active ? 'rgba(200,255,0,0.12)' : 'transparent', color: active ? '#C8FF00' : 'rgba(255,255,255,0.35)' }}>
      {icon}
    </button>
  )
}

/* ── Deploy Modal ────────────────────────────────────────────── */
function DeployModal({ businessName, onClose }: { businessName: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.96, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' })
  }, [])

  const slug      = businessName.toLowerCase().replace(/\s+/g, '-')
  const platforms = [
    { name: 'Vercel',  icon: '▲', color: '#ffffff', desc: 'Deploy to Vercel — fastest global CDN',   action: () => alert('Vercel deploy coming soon')  },
    { name: 'Netlify', icon: '◆', color: '#00C7B7', desc: 'Deploy to Netlify — free tier available', action: () => alert('Netlify deploy coming soon') },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', margin: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '0.25rem' }}>Deploy Your Site</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
              Will deploy as <span style={{ color: '#C8FF00' }}>{slug}.novux.app</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {platforms.map((p) => (
            <button key={p.name} onClick={p.action}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 200ms' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
              <span style={{ fontSize: '1.25rem', color: p.color, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>{p.name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{p.desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>→</span>
            </button>
          ))}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '1.25rem' }}>
          Full deploy API coming in Step 4. Connect your account to enable.
        </p>
      </div>
    </div>
  )
}

/* ── Builder View ────────────────────────────────────────────── */
function BuilderView({ generatedCode, businessName, template, onReset }: {
  generatedCode: string
  businessName: string
  template: string
  onReset: () => void
}) {
  const ref        = useRef<HTMLDivElement>(null)
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [device,          setDevice]          = useState<Device>('desktop')
  const [showDeploy,      setShowDeploy]      = useState(false)
  const [showChat,        setShowChat]        = useState(false)
  const [currentCode,     setCurrentCode]     = useState(generatedCode)
  const [chatLog,         setChatLog]         = useState<{ from: 'user' | 'ai'; text: string }[]>([])
  const [revisionInput,   setRevisionInput]   = useState('')
  const [isRevising,      setIsRevising]      = useState(false)
  const [revisionHistory, setRevisionHistory] = useState<{ role: string; content: string }[]>([])

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return
    gsap.to(iframeRef.current, { width: DEVICE_WIDTHS[device], duration: 0.4, ease: 'power3.out' })
  }, [device])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog])

  const handleRevision = async () => {
    if (!revisionInput.trim() || isRevising) return
    const userMessage = revisionInput.trim()
    setRevisionInput('')
    setIsRevising(true)
    setChatLog(prev => [...prev, { from: 'user', text: userMessage }])

    try {
      const res  = await fetch('/api/revise', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode, revisionRequest: userMessage, history: revisionHistory }),
      })
      const data = await res.json()

      if (data.updatedCode) {
        setCurrentCode(data.updatedCode)
        setRevisionHistory(prev => [
          ...prev,
          { role: 'user',      content: userMessage      },
          { role: 'assistant', content: data.updatedCode },
        ])
        setChatLog(prev => [...prev, { from: 'ai', text: '✓ Done — preview updated.' }])
      } else {
        setChatLog(prev => [...prev, { from: 'ai', text: 'Something went wrong. Try again.' }])
      }
    } catch {
      setChatLog(prev => [...prev, { from: 'ai', text: 'Request failed. Check your API connection.' }])
    } finally {
      setIsRevising(false)
    }
  }

  const downloadHTML = () => {
    const blob = new Blob([currentCode], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-website.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadNextJS = () => {
    const nextCode = `// Generated by Novux — paste into app/page.tsx
export default function Page() {
  return (
    <>
      <style>{\`${currentCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? ''}\`}</style>
      <div dangerouslySetInnerHTML={{ __html: \`${currentCode.replace(/`/g, '\\`')}\` }} />
    </>
  )
}
`
    const blob = new Blob([nextCode], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-page.tsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const slug = businessName.toLowerCase().replace(/\s+/g, '')

  return (
    <>
      <div ref={ref} style={{ opacity: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ height: '56px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '1rem', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.03em', flexShrink: 0 }}>
              NOV<span style={{ color: '#C8FF00' }}>UX</span>
            </span>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{businessName}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C8FF00', backgroundColor: 'rgba(200,255,0,0.1)', padding: '0.15rem 0.45rem', borderRadius: '99px', flexShrink: 0 }}>{template}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.25rem' }}>
            <DeviceBtn icon="🖥" label="Desktop" active={device === 'desktop'} onClick={() => setDevice('desktop')} />
            <DeviceBtn icon="📱" label="Tablet"  active={device === 'tablet'}  onClick={() => setDevice('tablet')}  />
            <DeviceBtn icon="📲" label="Mobile"  active={device === 'mobile'}  onClick={() => setDevice('mobile')}  />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MagneticBtn variant="ghost" size="sm" onClick={onReset}>↺ Rebuild</MagneticBtn>
            <MagneticBtn variant="ghost" size="sm" onClick={downloadHTML}>↓ HTML</MagneticBtn>
            <MagneticBtn variant="ghost" size="sm" onClick={downloadNextJS}>↓ Next.js</MagneticBtn>
            <button
              onClick={() => setShowChat(v => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.78rem', backgroundColor: showChat ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: showChat ? '#C8FF00' : 'rgba(255,255,255,0.55)', border: `1px solid ${showChat ? 'rgba(200,255,0,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '0.375rem 0.875rem', cursor: 'pointer', transition: 'all 200ms' }}>
              ✦ Revise
            </button>
            <MagneticBtn variant="accent" size="sm" onClick={() => setShowDeploy(true)}>▲ Deploy</MagneticBtn>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#060606', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', flexShrink: 0, backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.45)' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: 'rgba(234,179,8,0.45)' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.45)' }} />
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.6rem', color: '#C8FF00', opacity: 0.7 }}>🔒</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{slug}.novux.app</span>
              </div>
            </div>
            <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: device !== 'desktop' ? '1.5rem 0' : '0' }}>
              <iframe ref={iframeRef} srcDoc={currentCode}
                style={{ width: DEVICE_WIDTHS[device], height: '100%', border: 'none', display: 'block', borderRadius: device !== 'desktop' ? '12px' : '0', boxShadow: device !== 'desktop' ? '0 16px 64px rgba(0,0,0,0.8)' : 'none', transition: 'border-radius 300ms' }}
                title="Generated Site Preview"
              />
            </div>
          </div>

          {showChat && (
            <div style={{ width: '360px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.1rem' }}>AI Revision</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Tell the AI what to change</p>
                </div>
                <button onClick={() => setShowChat(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', lineHeight: 1, transition: 'color 150ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatLog.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <p style={{ fontSize: '1.75rem', marginBottom: '0.875rem', opacity: 0.6 }}>✦</p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '0.625rem' }}>What would you like to change?</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.7 }}>
                      Try:<br />
                      "Make the hero section darker"<br />
                      "Add a pricing section"<br />
                      "Change the accent color to blue"<br />
                      "Rewrite the copy for lawyers"
                    </p>
                  </div>
                )}
                {chatLog.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '0.625rem 0.875rem', borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', backgroundColor: msg.from === 'user' ? '#C8FF00' : '#1a1a1a', color: msg.from === 'user' ? '#000000' : '#ffffff', fontFamily: "'Inter', sans-serif", fontSize: '0.825rem', lineHeight: 1.5, border: msg.from === 'ai' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isRevising && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '12px 12px 12px 2px', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C8FF00', animation: `chatpulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                      <style>{`@keyframes chatpulse { 0%,80%,100%{opacity:0.3;transform:scale(0.85)}40%{opacity:1;transform:scale(1.15)} }`}</style>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <textarea
                    value={revisionInput}
                    onChange={(e) => setRevisionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRevision() } }}
                    placeholder="Make the hero section darker…"
                    rows={2}
                    style={{ flex: 1, backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.625rem 0.875rem', color: '#ffffff', fontSize: '0.825rem', outline: 'none', resize: 'none', fontFamily: "'Inter', sans-serif", lineHeight: 1.5, transition: 'border-color 200ms' }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(200,255,0,0.4)')}
                    onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                  <button onClick={handleRevision} disabled={!revisionInput.trim() || isRevising}
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', flexShrink: 0, backgroundColor: revisionInput.trim() && !isRevising ? '#C8FF00' : 'rgba(200,255,0,0.12)', color: revisionInput.trim() && !isRevising ? '#000' : 'rgba(200,255,0,0.35)', cursor: revisionInput.trim() && !isRevising ? 'pointer' : 'not-allowed', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}>
                    ↑
                  </button>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeploy && <DeployModal businessName={businessName} onClose={() => setShowDeploy(false)} />}
    </>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function BuilderPage() {
  const params   = useParams()
  const router   = useRouter()
  const template = params.template as string

  const [step,           setStep]           = useState(1)
  const [businessName,   setBusinessName]   = useState('')
  const [offering,       setOffering]       = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [goal,           setGoal]           = useState('')
  const [brandFeel,      setBrandFeel]      = useState('')
  const [variations,     setVariations]     = useState<string[]>([])
  const [generatedCode,  setGeneratedCode]  = useState('')
  const [currentState,   setCurrentState]   = useState<object | null>(null)
  const [readyCount,     setReadyCount]     = useState(0)
  const [isError,        setIsError]        = useState(false)

  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
  }, [])

  const generateOne = async (): Promise<{ html: string; state: object }> => {
    const res  = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, offering, targetCustomer, goal, brandFeel, template }),
    })
    const data = await res.json()
    setReadyCount(prev => prev + 1)
    return { html: data.html, state: data.state }
  }

  const handleGenerate = async () => {
    setIsError(false)
    setStep(6)
    setReadyCount(0)
    try {
      const results = await Promise.all([generateOne(), generateOne(), generateOne()])
      setVariations(results.map(r => r.html))
      // Store state from first variation (all 3 share the same brief/state)
      setCurrentState(results[0].state)
      setStep(7)
    } catch (err) {
      console.error(err)
      setIsError(true)
      setStep(5)
    }
  }

  const handlePick = async (html: string) => {
    setGeneratedCode(html)
    setStep(8)

    // Save to Supabase in the background
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      await fetch('/api/projects/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     businessName,
          template,
          html,
          state:    currentState,
          userId:   session.user.id,
        }),
      })
    } catch (err) {
      console.error('Save failed silently:', err)
    }
  }

  const handleReset = () => {
    setStep(1)
    setGeneratedCode('')
    setVariations([])
    setBusinessName('')
    setOffering('')
    setTargetCustomer('')
    setGoal('')
    setBrandFeel('')
    setCurrentState(null)
    setReadyCount(0)
    setIsError(false)
  }

  if (step === 8 && generatedCode) {
    return <BuilderView generatedCode={generatedCode} businessName={businessName} template={template} onReset={handleReset} />
  }

  if (step === 7 && variations.length === 3) {
    return <VariationPicker variations={variations} onPick={handlePick} onRegenerate={handleGenerate} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      <nav ref={headerRef} style={{ position: 'sticky', top: 0, zIndex: 50, opacity: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.125rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', backgroundColor: 'rgba(10,10,10,0.88)' }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', cursor: 'pointer' }} onClick={() => router.push('/')}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <MagneticBtn variant="ghost" onClick={() => router.push('/templates')}>← Templates</MagneticBtn>
      </nav>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '5rem 2rem 8rem' }}>
        {step <= 5 && <ProgressBar current={step} total={5} />}

        {step === 1 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 1 of 5</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                What's your<br />business called?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>This will appear throughout your website.</p>
            </div>
            <input autoFocus type="text" value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && businessName && setStep(2)}
              placeholder="e.g. Nova Studio, John's Bakery…"
              style={{ width: '100%', backgroundColor: '#111111', border: `1px solid ${businessName ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1rem 1.25rem', color: '#ffffff', fontSize: '1.0625rem', outline: 'none', fontFamily: "'Inter',sans-serif", transition: 'border-color 200ms', boxSizing: 'border-box' }}
            />
            <MagneticBtn variant="accent" fullWidth size="lg" disabled={!businessName} onClick={() => setStep(2)}>
              Continue →
            </MagneticBtn>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 2 of 5</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                What do you<br />offer?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>Products, services, skills — anything.</p>
            </div>
            <textarea autoFocus value={offering}
              onChange={(e) => setOffering(e.target.value)}
              placeholder="e.g. Premium haircuts and beard styling for men in Abuja…"
              rows={4}
              onFocus={(e) => (e.target.style.borderColor = '#C8FF00')}
              onBlur={(e)  => (e.target.style.borderColor = offering ? '#C8FF00' : 'rgba(255,255,255,0.08)')}
              style={{ width: '100%', backgroundColor: '#111111', border: `1px solid ${offering ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1rem 1.25rem', color: '#ffffff', fontSize: '1.0625rem', outline: 'none', resize: 'none', fontFamily: "'Inter',sans-serif", lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 200ms' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MagneticBtn variant="ghost" fullWidth size="lg" onClick={() => setStep(1)}>← Back</MagneticBtn>
              <MagneticBtn variant="accent" fullWidth size="lg" disabled={!offering} onClick={() => setStep(3)}>Continue →</MagneticBtn>
            </div>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 3 of 5</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                Who's your<br />customer?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>The AI tailors design and copy specifically for them.</p>
            </div>
            <input autoFocus type="text" value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && targetCustomer && setStep(4)}
              placeholder="e.g. University students in Abuja aged 18–25…"
              style={{ width: '100%', backgroundColor: '#111111', border: `1px solid ${targetCustomer ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1rem 1.25rem', color: '#ffffff', fontSize: '1.0625rem', outline: 'none', fontFamily: "'Inter',sans-serif", transition: 'border-color 200ms', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MagneticBtn variant="ghost" fullWidth size="lg" onClick={() => setStep(2)}>← Back</MagneticBtn>
              <MagneticBtn variant="accent" fullWidth size="lg" disabled={!targetCustomer} onClick={() => setStep(4)}>Continue →</MagneticBtn>
            </div>
          </StepPanel>
        )}

        {step === 4 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 4 of 5</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                What's the<br />main goal?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>This shapes layout, CTAs, and copywriting.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Get calls & enquiries',    emoji: '📞' },
                { label: 'Sell products online',      emoji: '🛒' },
                { label: 'Build trust & credibility', emoji: '🏆' },
                { label: 'Showcase my work',          emoji: '✦'  },
              ].map((opt) => (
                <SelectCard key={opt.label} label={opt.label} emoji={opt.emoji}
                  active={goal === opt.label} onClick={() => setGoal(opt.label)} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MagneticBtn variant="ghost" fullWidth size="lg" onClick={() => setStep(3)}>← Back</MagneticBtn>
              <MagneticBtn variant="accent" fullWidth size="lg" disabled={!goal} onClick={() => setStep(5)}>Continue →</MagneticBtn>
            </div>
          </StepPanel>
        )}

        {step === 5 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 5 of 5</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                What's your<br />brand feel?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>Sets the visual tone of your entire site.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Bold & powerful',          emoji: '⚡' },
                { label: 'Minimal & clean',          emoji: '◻' },
                { label: 'Elegant & premium',        emoji: '💎' },
                { label: 'Playful & friendly',       emoji: '🎨' },
                { label: 'Professional & corporate', emoji: '🏢' },
              ].map((opt) => (
                <SelectCard key={opt.label} label={opt.label} emoji={opt.emoji}
                  active={brandFeel === opt.label} onClick={() => setBrandFeel(opt.label)} />
              ))}
            </div>
            {isError && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.825rem', color: '#ef4444', textAlign: 'center', padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                Generation failed. Check your API credits and try again.
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MagneticBtn variant="ghost" fullWidth size="lg" onClick={() => setStep(4)}>← Back</MagneticBtn>
              <MagneticBtn variant="accent" fullWidth size="lg" disabled={!brandFeel} onClick={handleGenerate}>
                Generate 3 Variations ✦
              </MagneticBtn>
            </div>
          </StepPanel>
        )}

        {step === 6 && <LoadingStep count={readyCount} />}
      </main>
    </div>
  )
}