'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'

gsap.registerPlugin(ScrollTrigger)

/* ── Types ───────────────────────────────────────────────────── */
interface Site {
  id: string
  name: string
  template: string
  createdAt: string
  color: string
  html: string
}

type CheckStatus = 'pass' | 'warn' | 'fail'

interface SEOCheck {
  id: string
  label: string
  description: string
  status: CheckStatus
  detail: string
}

/* ── Template colors ─────────────────────────────────────────── */
const TEMPLATE_COLORS: Record<string, string> = {
  agency:     '#C8FF00',
  restaurant: '#FF6B35',
  portfolio:  '#A855F7',
  ecommerce:  '#00D4FF',
  saas:       '#FF3366',
}

function templateColor(template: string): string {
  return TEMPLATE_COLORS[template.toLowerCase()] ?? '#C8FF00'
}

/* ── SEO mock checks ─────────────────────────────────────────── */
const MOCK_SEO_CHECKS: SEOCheck[] = [
  { id: 'meta-title', label: 'Meta Title',       description: '', status: 'pass', detail: '"Nova Studio — Creative Agency" · 34 chars' },
  { id: 'meta-desc',  label: 'Meta Description', description: '', status: 'warn', detail: 'Present but 178 chars — trim by ~20'          },
  { id: 'alt-text',   label: 'Image Alt Text',   description: '', status: 'fail', detail: '3 of 7 images missing alt text'               },
  { id: 'schema',     label: 'Schema.org',       description: '', status: 'pass', detail: 'LocalBusiness schema found'                   },
  { id: 'og-tags',    label: 'Open Graph',       description: '', status: 'pass', detail: 'og:title, og:description, og:image present'   },
  { id: 'canonical',  label: 'Canonical URL',    description: '', status: 'warn', detail: 'Canonical missing on 2 pages'                 },
]

const SEO_SCORE = Math.round(
  MOCK_SEO_CHECKS.reduce((acc, c) => acc + (c.status === 'pass' ? 100 : c.status === 'warn' ? 60 : 0), 0) /
  MOCK_SEO_CHECKS.length
)

/* ── Shimmer style ───────────────────────────────────────────── */
const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '400px 100%',
  animation: 'shimmer 1.4s ease infinite',
} as const

/* ── Magnetic Button ─────────────────────────────────────────── */
function MagneticBtn({
  children, onClick, variant = 'accent', size = 'md', fullWidth = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
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
    if (!ref.current) return
    if (variant === 'accent') ref.current.style.boxShadow = '0 0 28px rgba(200,255,0,0.35)'
    else ref.current.style.backgroundColor = 'rgba(255,255,255,0.06)'
  }

  const pad = size === 'lg' ? '0.875rem 2rem' : size === 'sm' ? '0.4rem 1rem' : '0.65rem 1.5rem'
  const fs  = size === 'lg' ? '1rem' : size === 'sm' ? '0.8rem' : '0.875rem'

  return (
    <button ref={ref} onClick={onClick} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: fs, letterSpacing: '-0.01em', border: 'none', borderRadius: '10px', padding: pad, cursor: 'pointer', willChange: 'transform', transition: 'box-shadow 250ms, background-color 200ms', width: fullWidth ? '100%' : undefined, justifyContent: fullWidth ? 'center' : undefined, ...(variant === 'accent' ? { backgroundColor: '#C8FF00', color: '#000000' } : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }) }}>
      {children}
    </button>
  )
}

/* ── Delete Modal ────────────────────────────────────────────── */
function DeleteModal({ siteName, onConfirm, onCancel }: {
  siteName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.95, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power3.out' })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div ref={ref} style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <span style={{ color: '#ef4444', fontSize: '1.1rem' }}>✕</span>
        </div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '0.5rem' }}>Delete site?</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{siteName}</span> will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 200ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'opacity 200ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Stat Skeleton ───────────────────────────────────────────── */
function StatSkeleton() {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
      <div style={{ height: '10px', width: '60%', borderRadius: '6px', marginBottom: '0.75rem', ...shimmerStyle }} />
      <div style={{ height: '36px', width: '40%', borderRadius: '6px', marginBottom: '0.5rem', ...shimmerStyle }} />
      <div style={{ height: '10px', width: '50%', borderRadius: '6px', ...shimmerStyle }} />
    </div>
  )
}

/* ── Site Card Skeleton ──────────────────────────────────────── */
function SiteCardSkeleton() {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'hidden' }}>
      <div style={{ height: '130px', ...shimmerStyle }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ height: '14px', width: '55%', borderRadius: '6px', marginBottom: '0.75rem', ...shimmerStyle }} />
        <div style={{ height: '10px', width: '75%', borderRadius: '6px', ...shimmerStyle }} />
      </div>
    </div>
  )
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 })
  }, [])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', transition: 'border-color 250ms' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(200,255,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1, marginBottom: '0.375rem' }}>{value}</p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)' }}>{sub}</p>
    </div>
  )
}

/* ── Site Card ───────────────────────────────────────────────── */
function SiteCard({ site, index, onRequestDelete }: { site: Site; index: number; onRequestDelete: (id: string, name: string) => void }) {
  const ref     = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: index * 0.06, scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none none' } })
    }, ref)
    return () => ctx.revert()
  }, [index])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const onEnter = () => {
    if (!ref.current) return
    gsap.to(ref.current, { y: -4, duration: 0.3, ease: 'power2.out' })
    ref.current.style.borderColor = `${site.color}30`
  }
  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { y: 0, duration: 0.4, ease: 'power2.out' })
    ref.current.style.borderColor = 'rgba(255,255,255,0.07)'
  }

  const downloadHTML = () => {
    const blob = new Blob([site.html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${site.name.toLowerCase().replace(/\s+/g, '-')}-website.html`
    a.click()
    URL.revokeObjectURL(url)
    toast('Downloading your site…', 'info')
  }

  const initials  = site.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const menuItems = [
    { label: '↓ Download',   action: downloadHTML,                                                              danger: false },
    { label: '✦ Regenerate', action: () => {},                                                                  danger: false },
    { label: '✕ Delete',     action: () => { onRequestDelete(site.id, site.name); setMenuOpen(false) },        danger: true  },
  ]

  return (
    <div ref={ref} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ opacity: 0, position: 'relative', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', overflow: 'visible', transition: 'border-color 250ms' }}>
      <div style={{ height: '130px', background: `${site.color}0d`, borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: site.color, position: 'relative', zIndex: 1 }}>{initials}</span>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>{site.name}</h3>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(prev => !prev)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem', lineHeight: 1 }}>···</button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '130%', backgroundColor: '#1c1c1c', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', overflow: 'hidden', zIndex: 100, minWidth: '140px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
                {menuItems.map((item) => (
                  <button key={item.label} onClick={item.action}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: item.danger ? '#ef4444' : 'rgba(255,255,255,0.55)', transition: 'background 150ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)' }}>
            {site.template} · {new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: site.color, backgroundColor: `${site.color}18`, padding: '0.2rem 0.55rem', borderRadius: '99px' }}>Live</span>
        </div>
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────────── */
function EmptyState({ onBuild }: { onBuild: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.3 })
  }, [])
  return (
    <div ref={ref} style={{ opacity: 0, gridColumn: '1 / -1', backgroundColor: '#111111', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '5rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>✦</div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>No sites yet</h3>
      <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>Build your first AI-generated website in under 30 seconds.</p>
      <MagneticBtn variant="accent" size="lg" onClick={onBuild}>Build My First Site ✦</MagneticBtn>
    </div>
  )
}

/* ── SEO Score Ring ──────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const ref        = useRef<SVGCircleElement>(null)
  const size       = 120
  const stroke     = 7
  const r          = (size - stroke) / 2
  const circ       = 2 * Math.PI * r
  const scoreColor = score >= 80 ? '#C8FF00' : score >= 50 ? '#FF9500' : '#ef4444'

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { strokeDashoffset: circ }, { strokeDashoffset: circ - (score / 100) * circ, duration: 1.4, ease: 'power3.out', delay: 0.2, scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' } })
  }, [circ, score])

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle ref={ref} cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: scoreColor, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>Score</span>
      </div>
    </div>
  )
}

/* ── SEO Check Row ───────────────────────────────────────────── */
function SEOCheckRow({ check, index }: { check: SEOCheck; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', delay: index * 0.07, scrollTrigger: { trigger: ref.current, start: 'top 92%', toggleActions: 'play none none none' } })
    }, ref)
    return () => ctx.revert()
  }, [index])

  const s = { pass: { icon: '✓', color: '#C8FF00', bg: 'rgba(200,255,0,0.08)', label: 'Pass' }, warn: { icon: '!', color: '#FF9500', bg: 'rgba(255,149,0,0.08)', label: 'Warn' }, fail: { icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Fail' } }[check.status]

  return (
    <div ref={ref} style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', borderRadius: '12px', transition: 'background 200ms' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.75rem', fontWeight: 900, color: s.color }}>{s.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>{check.label}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.color, backgroundColor: s.bg, padding: '0.15rem 0.45rem', borderRadius: '99px' }}>{s.label}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{check.detail}</p>
      </div>
    </div>
  )
}

/* ── SEO Auditor ─────────────────────────────────────────────── */
function SEOAuditor({ siteName }: { siteName: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(false)
  const [ran,     setRan]     = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 88%', toggleActions: 'play none none none' } })
    }, ref)
    return () => ctx.revert()
  }, [])

  const runAudit = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setRan(true)
      toast(`Audit complete — score: ${SEO_SCORE}/100`, 'success')
    }, 1800)
  }

  const passCount = MOCK_SEO_CHECKS.filter(c => c.status === 'pass').length
  const warnCount = MOCK_SEO_CHECKS.filter(c => c.status === 'warn').length
  const failCount = MOCK_SEO_CHECKS.filter(c => c.status === 'fail').length

  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem' }}>◈</span>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>SEO Auditor</h3>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C8FF00', backgroundColor: 'rgba(200,255,0,0.1)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>AI</span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            Auditing: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{siteName}</span>
          </p>
        </div>
        <MagneticBtn variant={ran ? 'ghost' : 'accent'} size="sm" onClick={runAudit}>
          {running ? '⟳ Running…' : ran ? '↺ Re-run Audit' : '▶ Run Audit'}
        </MagneticBtn>
      </div>

      {!ran && !running && (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
            Run an audit to get your SEO Health Score,<br />meta tag analysis, and structured data report.
          </p>
        </div>
      )}

      {running && (
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C8FF00', display: 'inline-block', animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>Analysing your site…</p>
          <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {ran && !running && (
        <div style={{ padding: '1.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '0.5rem 0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <ScoreRing score={SEO_SCORE} />
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[{ label: 'Passed', value: passCount, color: '#C8FF00' }, { label: 'Warnings', value: warnCount, color: '#FF9500' }, { label: 'Failed', value: failCount, color: '#ef4444' }].map(item => (
                <div key={item.label}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: item.color, lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MOCK_SEO_CHECKS.map((check, i) => <SEOCheckRow key={check.id} check={check} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const router    = useRouter()
  const { toast } = useToast()
  const navRef    = useRef<HTMLElement>(null)
  const greetRef  = useRef<HTMLDivElement>(null)

  const [sites,    setSites]    = useState<Site[]>([])
  const [loading,  setLoading]  = useState(true)
  const [userName, setUserName] = useState('there')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) setUserName(profile.full_name.split(' ')[0])
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast('Failed to load your sites', 'error')
      } else if (data) {
        setSites(data.map((p) => ({
          id:        p.id,
          name:      p.name,
          template:  p.template,
          createdAt: p.created_at,
          color:     templateColor(p.template),
          html:      p.content?.html ?? '',
        })))
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,   { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' })
      gsap.fromTo(greetRef.current, { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.12 })
    })
    return () => ctx.revert()
  }, [])

  const deleteSite = async (id: string) => {
    setConfirmDelete(null)
    setSites(prev => prev.filter(s => s.id !== id))
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      toast('Failed to delete site', 'error')
    } else {
      toast('Site deleted', 'success')
    }
  }

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Sites Built',      value: loading ? '—' : String(sites.length),                             sub: 'Total generations' },
    { label: 'This Month',       value: loading ? '—' : String(sites.length),                             sub: 'New this month'    },
    { label: 'Templates Used',   value: loading ? '—' : String(new Set(sites.map(s => s.template)).size), sub: 'Unique styles'     },
    { label: 'API Credits Left', value: '$5.00',                                                          sub: 'Anthropic balance' },
  ]

  const latestSite = sites[0]?.name ?? 'No site selected'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <DeleteModal
          siteName={confirmDelete.name}
          onConfirm={() => deleteSite(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <nav ref={navRef} style={{ position: 'sticky', top: 0, zIndex: 50, opacity: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.125rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', backgroundColor: 'rgba(10,10,10,0.88)' }}>
        <h1 onClick={() => router.push('/')} style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.03em', cursor: 'pointer' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MagneticBtn variant="ghost" size="md" onClick={async () => {
            await supabase.auth.signOut()
            toast('Signed out', 'info')
            router.push('/auth/login')
          }}>Sign Out</MagneticBtn>
          <MagneticBtn variant="accent" size="md" onClick={() => router.push('/templates')}>+ New Site</MagneticBtn>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>

        <div ref={greetRef} style={{ opacity: 0, marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', marginBottom: '0.375rem' }}>{greeting}, {userName}</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Your <span style={{ color: '#C8FF00' }}>Dashboard</span>
          </h2>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {loading
            ? [0,1,2,3].map(i => <StatSkeleton key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)
          }
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>Recent Sites</p>
          {sites.length > 0 && <MagneticBtn variant="ghost" size="sm" onClick={() => router.push('/templates')}>+ New Site</MagneticBtn>}
        </div>

        {/* Sites */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          {loading
            ? [0,1,2].map(i => <SiteCardSkeleton key={i} />)
            : sites.length === 0
            ? <EmptyState onBuild={() => router.push('/templates')} />
            : sites.map((site, i) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  index={i}
                  onRequestDelete={(id, name) => setConfirmDelete({ id, name })}
                />
              ))
          }
        </div>

        {sites.length > 0 && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>SEO Health</p>
            </div>
            <SEOAuditor siteName={latestSite} />
          </>
        )}

      </main>
    </div>
  )
}