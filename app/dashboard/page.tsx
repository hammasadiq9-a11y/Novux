'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '@/lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #050505;
    --surface:    #0f0f0f;
    --surface2:   #161616;
    --border:     rgba(255,255,255,0.07);
    --border2:    rgba(255,255,255,0.12);
    --text:       #EFEFEF;
    --muted:      rgba(239,239,239,0.35);
    --accent:     #E8FF47;
    --accent-dim: rgba(232,255,71,0.07);
    --accent-mid: rgba(232,255,71,0.16);
    --danger:     #FF4D4D;
    --warn:       #FF9500;
    --success:    #4ade80;
    --f-display:  'Clash Display', sans-serif;
    --f-label:    'Bebas Neue', sans-serif;
    --f-body:     'Satoshi', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); }
  ::selection { background: var(--accent); color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
  @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
  @keyframes pulse   { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes spin    { to { transform: rotate(360deg); } }
`

const THUMB = { SCALE: 0.21, W: 1280, H: 900 } as const

const TEMPLATE_COLORS: Record<string, string> = {
  agency:     '#E8FF47',
  restaurant: '#FF6B35',
  portfolio:  '#A855F7',
  ecommerce:  '#00D4FF',
  saas:       '#FF3366',
  barbershop: '#F59E0B',
  pharmacy:   '#10B981',
  law:        '#6366F1',
  realestate: '#14B8A6',
  church:     '#F43F5E',
  startup:    '#8B5CF6',
  nonprofit:  '#EF4444',
}
const templateColor = (t: string) => TEMPLATE_COLORS[t.toLowerCase()] ?? '#E8FF47'

interface Site {
  id:        string
  name:      string
  template:  string
  createdAt: string
  color:     string
  html:      string
}

type CheckStatus = 'pass' | 'warn' | 'fail'

interface Check {
  id:     string
  label:  string
  status: CheckStatus
  detail: string
  points: number
  earned: number
}

interface Category {
  id:    string
  label: string
  checks: Check[]
  score: number
}

interface SiteIQResult {
  overall:    number
  categories: Category[]
  generated:  string
}

// ─── Primitives ───────────────────────────────────────────────────────────────
const Rule  = ({ style }: { style?: React.CSSProperties }) => <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>{children}</span>
)

function Btn({ children, onClick, variant = 'accent', size = 'md', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'accent' | 'ghost' | 'danger'; size?: 'sm' | 'md'; disabled?: boolean
}) {
  const styles = {
    accent: { backgroundColor: 'var(--accent)',        color: '#000',          border: 'none' },
    ghost:  { backgroundColor: 'transparent',          color: 'var(--muted)',  border: '1px solid var(--border)' },
    danger: { backgroundColor: 'rgba(255,77,77,0.08)', color: 'var(--danger)', border: '1px solid rgba(255,77,77,0.2)' },
  }
  const pads = { sm: '0.35rem 0.875rem', md: '0.6rem 1.375rem' }
  const fszs = { sm: '0.75rem',          md: '0.85rem' }
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...styles[variant], fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: fszs[size], padding: pads[size], borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'opacity 200ms', whiteSpace: 'nowrap' }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.82')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >{children}</button>
  )
}

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.6s ease infinite',
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { gsap.fromTo(ref.current, { opacity: 0, scale: 0.96, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power3.out' }) }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div ref={ref} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '100%' }}>
        <Label style={{ display: 'block', marginBottom: '1rem' }}>CONFIRM DELETE</Label>
        <Rule style={{ marginBottom: '1.5rem' }} />
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Delete site?</h3>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{name}</span> will be permanently removed. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete permanently</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
    <div style={{ height: '9px',  width: '55%', borderRadius: '4px', marginBottom: '0.875rem', ...shimmer }} />
    <div style={{ height: '34px', width: '40%', borderRadius: '4px', marginBottom: '0.5rem',   ...shimmer }} />
    <div style={{ height: '9px',  width: '45%', borderRadius: '4px', ...shimmer }} />
  </div>
)
const CardSkeleton = () => (
  <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
    <div style={{ height: '155px', ...shimmer }} />
    <div style={{ padding: '1.25rem' }}>
      <div style={{ height: '13px', width: '50%', borderRadius: '4px', marginBottom: '0.75rem', ...shimmer }} />
      <div style={{ height: '10px', width: '70%', borderRadius: '4px', ...shimmer }} />
    </div>
  </div>
)

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, index }: { label: string; value: string; sub: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: index * 0.07 }) }, [index])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', transition: 'border-color 250ms' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <Label style={{ display: 'block', marginBottom: '0.75rem' }}>{label.toUpperCase()}</Label>
      <p style={{ fontFamily: 'var(--f-label)', fontSize: '2.75rem', color: 'var(--text)', lineHeight: 1, marginBottom: '0.375rem' }}>{value}</p>
      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>{sub}</p>
    </div>
  )
}

// ─── Site card ────────────────────────────────────────────────────────────────
function SiteCard({ site, index, onDelete }: { site: Site; index: number; onDelete: (id: string, name: string) => void }) {
  const ref     = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: index * 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 92%', toggleActions: 'play none none none' },
      })
    }, ref)
    return () => ctx.revert()
  }, [index])

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  const downloadHTML = () => {
    const a = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([site.html], { type: 'text/html' })),
      download: `${site.name.toLowerCase().replace(/\s+/g, '-')}.html`,
    })
    a.click()
  }

  const initials = site.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div ref={ref} style={{ opacity: 0, position: 'relative', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'visible', transition: 'border-color 300ms' }}
      onMouseEnter={() => { setHovered(true);  gsap.to(ref.current, { y: -4, duration: 0.3, ease: 'power2.out' }); if (ref.current) ref.current.style.borderColor = 'var(--border2)' }}
      onMouseLeave={() => { setHovered(false); gsap.to(ref.current, { y: 0,  duration: 0.4, ease: 'power2.out' }); if (ref.current) ref.current.style.borderColor = 'var(--border)'  }}
    >
      <div style={{ height: '155px', borderRadius: '14px 14px 0 0', overflow: 'hidden', position: 'relative', backgroundColor: '#000', borderBottom: '1px solid var(--border)' }}>
        {site.html ? (
          <>
            <div style={{ width: `${THUMB.W * THUMB.SCALE}px`, height: `${THUMB.H * THUMB.SCALE}px` }}>
              <iframe srcDoc={site.html} style={{ width: `${THUMB.W}px`, height: `${THUMB.H}px`, border: 'none', transform: `scale(${THUMB.SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }} title={site.name} sandbox="allow-same-origin" />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.2)' : 'linear-gradient(to bottom, transparent 40%, rgba(15,15,15,0.95) 100%)', transition: 'background 300ms' }} />
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--f-label)', fontSize: '3rem', color: 'var(--border2)' }}>{initials}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{site.name}</h3>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(v => !v)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem', lineHeight: 1, letterSpacing: '0.1em' }}>···</button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '130%', backgroundColor: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '10px', overflow: 'hidden', zIndex: 100, minWidth: '150px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                {[
                  { label: '↓ Download',    action: downloadHTML,                                                              danger: false },
                  { label: '↺ Rebuild',     action: () => router.push('/templates'),                                          danger: false },
                  { label: '✕ Delete site', action: () => { onDelete(site.id, site.name); setMenuOpen(false) },               danger: true  },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: item.danger ? 'var(--danger)' : 'var(--muted)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>
            {site.template} · {new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <Label style={{ color: site.color, backgroundColor: `${site.color}18`, border: `1px solid ${site.color}28`, borderRadius: '4px', padding: '0.15rem 0.5rem' }}>LIVE</Label>
        </div>
      </div>
    </div>
  )
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const circleRef = useRef<SVGCircleElement>(null)
  const size = 110, stroke = 7, r = (size - stroke) / 2, circ = 2 * Math.PI * r
  const color = score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warn)' : 'var(--danger)'
  useEffect(() => {
    if (!circleRef.current) return
    gsap.fromTo(circleRef.current,
      { strokeDashoffset: circ },
      { strokeDashoffset: circ - (score / 100) * circ, duration: 1.6, ease: 'power3.out', delay: 0.2 }
    )
  }, [circ, score])
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle ref={circleRef} cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color, lineHeight: 1 }}>{score}</span>
        <Label>SCORE</Label>
      </div>
    </div>
  )
}

// ─── Category bar ─────────────────────────────────────────────────────────────
function CategoryBar({ label, score }: { label: string; score: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const color  = score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warn)' : 'var(--danger)'
  useEffect(() => {
    if (!barRef.current) return
    gsap.fromTo(barRef.current, { width: '0%' }, { width: `${score}%`, duration: 1.2, ease: 'power3.out', delay: 0.3 })
  }, [score])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Label style={{ width: '110px', flexShrink: 0 }}>{label.toUpperCase()}</Label>
      <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div ref={barRef} style={{ height: '100%', backgroundColor: color, borderRadius: '99px', width: '0%' }} />
      </div>
      <span style={{ fontFamily: 'var(--f-label)', fontSize: '1rem', color, width: '36px', textAlign: 'right', flexShrink: 0 }}>{score}</span>
    </div>
  )
}

// ─── Real SiteIQ Panel ────────────────────────────────────────────────────────
function SiteIQPanel({ site }: { site: Site }) {
  const [running,    setRunning]    = useState(false)
  const [result,     setResult]     = useState<SiteIQResult | null>(null)
  const [error,      setError]      = useState('')
  const [activeTab,  setActiveTab]  = useState('overview')

  const statusStyle = {
    pass: { color: 'var(--accent)', bg: 'var(--accent-dim)',      label: 'PASS' },
    warn: { color: 'var(--warn)',   bg: 'rgba(255,149,0,0.08)',   label: 'WARN' },
    fail: { color: 'var(--danger)', bg: 'rgba(255,77,77,0.08)',   label: 'FAIL' },
  }

  const runAudit = async () => {
    if (!site.html) { setError('No HTML found for this site.'); return }
    setRunning(true)
    setError('')
    try {
      const res  = await fetch('/api/siteiq', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ html: site.html, projectId: site.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Audit failed.'); return }
      setResult(data)
      setActiveTab('overview')
    } catch {
      setError('Request failed. Check your connection.')
    } finally {
      setRunning(false)
    }
  }

  const allChecks  = result?.categories.flatMap(c => c.checks) ?? []
  const passCount  = allChecks.filter(c => c.status === 'pass').length
  const warnCount  = allChecks.filter(c => c.status === 'warn').length
  const failCount  = allChecks.filter(c => c.status === 'fail').length

  const tabs = result
    ? [{ id: 'overview', label: 'Overview' }, ...result.categories.map(c => ({ id: c.id, label: c.label }))]
    : []

  const activeCategory = result?.categories.find(c => c.id === activeTab)

  return (
    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Label style={{ display: 'block', marginBottom: '0.4rem' }}>SITEIQ</Label>
          <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{site.name}</p>
        </div>
        <Btn variant={result ? 'ghost' : 'accent'} size="sm" onClick={runAudit} disabled={running}>
          {running ? '⟳ Analysing…' : result ? '↺ Re-run' : '▶ Run SiteIQ'}
        </Btn>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(255,77,77,0.06)', borderBottom: '1px solid rgba(255,77,77,0.15)' }}>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!result && !running && !error && (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--f-label)', fontSize: '3.5rem', color: 'var(--border2)', marginBottom: '1rem' }}>◈</p>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            SiteIQ analyses your generated HTML across<br />
            SEO, Performance, Accessibility, Design, and Conversion.
          </p>
        </div>
      )}

      {/* Loading */}
      {running && (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '6px', marginBottom: '1.25rem' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
          </div>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)' }}>
            Parsing HTML · Scoring 5 categories…
          </p>
        </div>
      )}

      {/* Results */}
      {result && !running && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.78rem', padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`, color: activeTab === t.id ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', transition: 'color 200ms', whiteSpace: 'nowrap', marginBottom: '-1px' }}>
                {t.label}
                {t.id !== 'overview' && result.categories.find(c => c.id === t.id) && (
                  <span style={{ marginLeft: '0.4rem', fontFamily: 'var(--f-label)', fontSize: '0.7rem', color: 'inherit', opacity: 0.7 }}>
                    {result.categories.find(c => c.id === t.id)!.score}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div style={{ padding: '1.75rem' }}>
              {/* Score row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <ScoreRing score={result.overall} />
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {[
                    { l: 'Passed',   v: passCount, c: 'var(--accent)' },
                    { l: 'Warnings', v: warnCount, c: 'var(--warn)'   },
                    { l: 'Failed',   v: failCount, c: 'var(--danger)' },
                  ].map(s => (
                    <div key={s.l}>
                      <p style={{ fontFamily: 'var(--f-label)', fontSize: '2.25rem', color: s.c, lineHeight: 1 }}>{s.v}</p>
                      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: 'var(--f-body)', fontSize: '0.68rem', color: 'var(--muted)' }}>
                  {new Date(result.generated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Category bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.categories.map(cat => (
                  <CategoryBar key={cat.id} label={cat.label} score={cat.score} />
                ))}
              </div>
            </div>
          )}

          {/* Category tab */}
          {activeCategory && (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <Label style={{ display: 'block', marginBottom: '0.25rem' }}>{activeCategory.label.toUpperCase()}</Label>
                  <p style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color: activeCategory.score >= 80 ? 'var(--accent)' : activeCategory.score >= 50 ? 'var(--warn)' : 'var(--danger)', lineHeight: 1 }}>
                    {activeCategory.score}<span style={{ fontSize: '1rem', opacity: 0.5 }}>/100</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {(['pass', 'warn', 'fail'] as CheckStatus[]).map(s => (
                    <div key={s} style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--f-label)', fontSize: '1.25rem', color: statusStyle[s].color, lineHeight: 1 }}>
                        {activeCategory.checks.filter(c => c.status === s).length}
                      </p>
                      <Label style={{ color: statusStyle[s].color }}>{statusStyle[s].label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Rule style={{ marginBottom: '0.75rem' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {activeCategory.checks.map(check => {
                  const s = statusStyle[check.status]
                  return (
                    <div key={check.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem', borderRadius: '8px', transition: 'background 150ms' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Label style={{ color: s.color, backgroundColor: s.bg, border: `1px solid ${s.color}28`, borderRadius: '4px', padding: '0.15rem 0.4rem', flexShrink: 0, width: '38px', textAlign: 'center' }}>
                        {s.label}
                      </Label>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.825rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{check.label}</p>
                        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{check.detail}</p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <Label>{check.earned}/{check.points} pts</Label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onBuild }: { onBuild: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { gsap.fromTo(ref.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 }) }, [])
  return (
    <div ref={ref} style={{ opacity: 0, gridColumn: '1 / -1', border: '1px dashed var(--border)', borderRadius: '14px', padding: '5rem 2rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--f-label)', fontSize: '4rem', color: 'var(--border2)', marginBottom: '1.25rem' }}>✦</p>
      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>No sites yet</h3>
      <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        Build your first AI-generated website in under 60 seconds.
      </p>
      <Btn variant="accent" onClick={onBuild}>Build my first site →</Btn>
    </div>
  )
}

// ─── Site selector for SiteIQ ─────────────────────────────────────────────────
function SiteIQSection({ sites }: { sites: Site[] }) {
  const [selectedId, setSelectedId] = useState(sites[0]?.id ?? '')
  const selected = sites.find(s => s.id === selectedId) ?? sites[0]
  if (!selected) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Label>SITEIQ ANALYSIS</Label>
        {sites.length > 1 && (
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--text)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.35rem 0.75rem', cursor: 'pointer', outline: 'none' }}
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>
      <Rule style={{ marginBottom: '1.5rem' }} />
      <SiteIQPanel site={selected} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router  = useRouter()
  const navRef  = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const [sites,    setSites]    = useState<Site[]>([])
  const [loading,  setLoading]  = useState(true)
  const [userName, setUserName] = useState('there')
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
useEffect(() => {
  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
     
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      if (profile?.full_name) setUserName(profile.full_name.split(' ')[0])
      if (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) setIsAdmin(true)
    }
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) {
      setSites(data.map(p => ({
        id:        p.id,
        name:      p.name,
        template:  p.template,
        createdAt: p.created_at,
        color:     templateColor(p.template),
        html:      p.html ?? '',
      })))
    }
    setLoading(false)
  }
  init()
}, [])

  useEffect(() => {
    gsap.fromTo(navRef.current,  { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
    gsap.fromTo(heroRef.current, { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.1 })
  }, [])

  const deleteSite = async (id: string) => {
    setToDelete(null)
    setSites(p => p.filter(s => s.id !== id))
    await supabase.from('projects').delete().eq('id', id)
  }

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Sites Built',    value: loading ? '—' : String(sites.length),                                                                                                        sub: 'Total generations' },
    { label: 'This Month',     value: loading ? '—' : String(sites.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length),                                sub: 'New this month'    },
    { label: 'Templates Used', value: loading ? '—' : String(new Set(sites.map(s => s.template)).size),                                                                           sub: 'Unique styles'     },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>
      {toDelete && <DeleteModal name={toDelete.name} onConfirm={() => deleteSite(toDelete.id)} onCancel={() => setToDelete(null)} />}

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ opacity: 0, position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.9)' }}>
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em', cursor: 'pointer' }} onClick={() => router.push('/')}>
          NOV<span style={{ color: 'var(--accent)' }}>UX</span>
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Btn variant="ghost" size="sm" onClick={() => router.push('/lead-finder')}>✦ Lead Finder</Btn>
          {isAdmin && <Btn variant="ghost" size="sm" onClick={() => router.push('/admin')}>⚡ Admin</Btn>}
          <Btn variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}>Sign out</Btn>
          <Btn variant="accent" size="sm" onClick={() => router.push('/templates')}>+ New site</Btn>
        </div>
      </nav>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '4rem 2.5rem 10rem' }}>

        {/* ── Greeting ── */}
        <div ref={heroRef} style={{ opacity: 0, marginBottom: '3.5rem' }}>
          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>{greeting.toUpperCase()}, {userName.toUpperCase()}</Label>
          <Rule style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
            Your<br /><span style={{ color: 'var(--accent)' }}>Dashboard.</span>
          </h2>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', backgroundColor: 'var(--border)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '3.5rem' }}>
          {loading
            ? [0,1,2,3].map(i => <div key={i} style={{ backgroundColor: 'var(--bg)' }}><StatSkeleton /></div>)
            : stats.map((s, i) => <div key={s.label} style={{ backgroundColor: 'var(--bg)' }}><StatCard {...s} index={i} /></div>)
          }
        </div>

        {/* ── Sites ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Label>RECENT SITES</Label>
          {sites.length > 0 && <Btn variant="ghost" size="sm" onClick={() => router.push('/templates')}>+ New site</Btn>}
        </div>
        <Rule style={{ marginBottom: '1.5rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {loading
            ? [0,1,2].map(i => <CardSkeleton key={i} />)
            : sites.length === 0
            ? <EmptyState onBuild={() => router.push('/templates')} />
            : sites.map((site, i) => <SiteCard key={site.id} site={site} index={i} onDelete={(id, name) => setToDelete({ id, name })} />)
          }
        </div>

        {/* ── SiteIQ ── */}
        {!loading && sites.length > 0 && <SiteIQSection sites={sites} />}
      </main>
    </div>
  )
}