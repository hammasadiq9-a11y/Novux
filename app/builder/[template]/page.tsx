'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #050505;
    --surface:  #0f0f0f;
    --surface2: #161616;
    --border:   rgba(255,255,255,0.07);
    --border2:  rgba(255,255,255,0.12);
    --text:     #EFEFEF;
    --muted:    rgba(239,239,239,0.35);
    --accent:   #E8FF47;
    --accent-dim: rgba(232,255,71,0.08);
    --accent-mid: rgba(232,255,71,0.18);
    --danger:   #FF4D4D;
    --success:  #4ade80;
    --f-display: 'Clash Display', sans-serif;
    --f-label:   'Bebas Neue', sans-serif;
    --f-body:    'Satoshi', sans-serif;
  }

  html { background: var(--bg); color: var(--text); }
  ::selection { background: var(--accent); color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0%,100% { opacity:.3; } 50% { opacity:1; } }
  @keyframes pulse   { 0%,80%,100% { opacity:.2; transform:scale(.8); } 40% { opacity:1; transform:scale(1.1); } }
`

type Device = 'desktop' | 'tablet' | 'mobile'
const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: '100%',
  tablet:  '768px',
  mobile:  '390px',
}

const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.7rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>{children}</span>
)

const Rule = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
)

function Btn({ children, onClick, disabled = false, variant = 'accent', size = 'md', fullWidth = false }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean
  variant?: 'accent' | 'ghost' | 'outline'; size?: 'sm' | 'md' | 'lg'; fullWidth?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const styles: Record<string, React.CSSProperties> = {
    accent:  { background: 'var(--accent)',  color: '#000', border: 'none' },
    ghost:   { background: 'transparent',    color: 'var(--muted)', border: '1px solid var(--border)' },
    outline: { background: 'transparent',    color: 'var(--text)',  border: '1px solid var(--border2)' },
  }
  const pads = { sm: '0.4rem 1rem', md: '0.65rem 1.5rem', lg: '0.9rem 2.25rem' }
  const sizes = { sm: '0.75rem', md: '0.85rem', lg: '0.95rem' }
  const onEnter = () => {
    if (!ref.current || disabled) return
    if (variant === 'accent') gsap.to(ref.current, { scale: 1.03, duration: 0.25, ease: 'power2.out' })
    else gsap.to(ref.current, { borderColor: 'rgba(255,255,255,0.25)', color: '#fff', duration: 0.2 })
  }
  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { scale: 1, borderColor: variant === 'outline' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)', color: variant === 'accent' ? '#000' : variant === 'outline' ? '#efefef' : 'rgba(239,239,239,0.35)', duration: 0.3, ease: 'power2.out' })
  }
  return (
    <button ref={ref} onClick={disabled ? undefined : onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ ...styles[variant], fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: sizes[size], letterSpacing: '0.01em', padding: pads[size], borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, width: fullWidth ? '100%' : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'opacity 200ms', willChange: 'transform' }}>
      {children}
    </button>
  )
}

function StepRail({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '3rem' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: '2px', borderRadius: '99px', backgroundColor: i < current ? 'var(--accent)' : 'var(--border)', transition: 'background-color 400ms ease' }} />
      ))}
    </div>
  )
}

function StepPanel({ children, stepNum }: { children: React.ReactNode; stepNum: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power4.out' })
  }, [])
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 2.5rem', opacity: 0 }}>
      <div style={{ paddingTop: '0.25rem' }}>
        <div style={{ fontFamily: 'var(--f-label)', fontSize: '6rem', lineHeight: 1, color: 'var(--border2)', userSelect: 'none' }}>
          {String(stepNum).padStart(2, '0')}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>{children}</div>
    </div>
  )
}

function SelectCard({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const onEnter = () => { if (ref.current && !active) gsap.to(ref.current, { borderColor: 'rgba(255,255,255,0.18)', duration: 0.2 }) }
  const onLeave = () => { if (ref.current && !active) gsap.to(ref.current, { borderColor: 'rgba(255,255,255,0.07)', duration: 0.3 }) }
  return (
    <button ref={ref} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: '10px', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: active ? 'var(--accent-dim)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background-color 200ms' }}>
      <div>
        <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.9rem', color: active ? 'var(--accent)' : 'var(--text)' }}>{label}</p>
        {sub && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{sub}</p>}
      </div>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border2)'}`, backgroundColor: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 200ms' }}>
        {active && <span style={{ fontSize: '0.55rem', color: '#000', fontWeight: 900 }}>✓</span>}
      </div>
    </button>
  )
}

function Input({ value, onChange, onKeyDown, placeholder, autoFocus = false }: {
  value: string; onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent) => void; placeholder?: string; autoFocus?: boolean
}) {
  return (
    <input autoFocus={autoFocus} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder}
      style={{ width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem', color: 'var(--text)', fontSize: '1rem', fontFamily: 'var(--f-body)', outline: 'none', transition: 'border-color 200ms' }}
      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
      onBlur={e  => (e.target.style.borderColor = value ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.07)')}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem', color: 'var(--text)', fontSize: '1rem', fontFamily: 'var(--f-body)', outline: 'none', resize: 'none', lineHeight: 1.6, transition: 'border-color 200ms' }}
      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
      onBlur={e  => (e.target.style.borderColor = value ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.07)')}
    />
  )
}

function LoadingView({ count }: { count: number }) {
  const linesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!linesRef.current) return
    gsap.fromTo(linesRef.current.children, { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.22, delay: 0.5, duration: 0.5, ease: 'power3.out' })
  }, [])
  const steps = ['Interpreting your brief', 'Designing layout systems', 'Writing conversion copy', 'Composing GSAP animations', 'Optimising for all devices']
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
        <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '3rem' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--border)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', borderTop: '1.5px solid var(--accent)', borderRight: '1.5px solid transparent', borderBottom: '1.5px solid transparent', borderLeft: '1.5px solid transparent', animation: 'spin 1s linear infinite' }} />
        </div>
        <Rule style={{ marginBottom: '2rem' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '5rem', lineHeight: 1, color: 'var(--accent)' }}>{count}</span>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color: 'var(--border2)' }}>/ 2</span>
        </div>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '3rem' }}>
          {count === 0 ? 'Generating your variations…' : count === 1 ? 'First variation ready — finishing second…' : 'Both variations ready.'}
        </p>
        <Rule style={{ marginBottom: '2rem' }} />
        <div ref={linesRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, backgroundColor: i < (count * 2.5) ? 'var(--accent)' : 'var(--border2)', transition: 'background-color 400ms' }} />
              <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: i < (count * 2.5) ? 'var(--text)' : 'var(--muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VariationPicker({ variations, onPick, onRegenerate }: { variations: string[]; onPick: (html: string) => void; onRegenerate: () => void }) {
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef   = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    gsap.fromTo(gridRef.current!.children, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, delay: 0.2, duration: 0.65, ease: 'power3.out' })
  }, [])
  const SCALE = 0.21, IFRAME_W = 1280, IFRAME_H = 900, CONT_H = IFRAME_H * SCALE
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '5rem 2rem 8rem' }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div ref={headerRef} style={{ marginBottom: '4rem', opacity: 0 }}>
          <Label style={{ display: 'block', marginBottom: '1rem' }}>STEP 7 — CHOOSE YOUR VARIATION</Label>
          <Rule style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, color: 'var(--text)' }}>
            Two sites.<br /><span style={{ color: 'var(--accent)' }}>Pick one.</span>
          </h2>
        </div>
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          {variations.map((html, i) => (
            <div key={i} onClick={() => onPick(html)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${hovered === i ? 'rgba(232,255,71,0.35)' : 'var(--border)'}`, backgroundColor: 'var(--surface)', cursor: 'pointer', transition: 'border-color 250ms, transform 300ms', transform: hovered === i ? 'translateY(-6px)' : 'translateY(0)', opacity: 0 }}>
              <div style={{ backgroundColor: 'var(--surface2)', padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {['rgba(255,100,100,0.5)', 'rgba(255,200,50,0.5)', 'rgba(100,220,100,0.5)'].map((c, j) => <div key={j} style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c }} />)}
                <div style={{ flex: 1, height: '20px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)' }}>variation-{i + 1}.novux.app</span>
                </div>
              </div>
              <div style={{ width: '100%', height: `${CONT_H}px`, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
                <iframe srcDoc={html} style={{ width: `${IFRAME_W}px`, height: `${IFRAME_H}px`, border: 'none', transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }} title={`Variation ${i + 1}`} />
                {hovered === i && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'var(--accent)', color: '#000', fontFamily: 'var(--f-body)', fontWeight: 700, fontSize: '0.85rem', padding: '0.65rem 1.75rem', borderRadius: '8px' }}>Select this variation →</div>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Variation {i + 1}</p>
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem' }}>Unique layout · unique copy</p>
                </div>
                <Btn variant={hovered === i ? 'accent' : 'ghost'} size="sm" onClick={() => onPick(html)}>Select</Btn>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onRegenerate}
            style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            ↺ Not what you expected? Regenerate both
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Real Deploy Modal ────────────────────────────────────────────────────────
function DeployModal({ businessName, html, projectId, onClose }: {
  businessName: string
  html:         string
  projectId:    string | null
  onClose:      () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' })
  }, [])

  type DeployState = 'idle' | 'deploying' | 'success' | 'error'
  const [state,   setState]   = useState<DeployState>('idle')
  const [liveUrl, setLiveUrl] = useState('')
  const [errMsg,  setErrMsg]  = useState('')
  const [copyOk,  setCopyOk]  = useState(false)

  const slug = businessName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60)

  const deploy = async () => {
    setState('deploying')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/deploy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          html,
          businessName,
          projectId,
          userId: session?.user?.id ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error ?? 'Deployment failed'); setState('error'); return }
      setLiveUrl(data.url)
      setState('success')
    } catch {
      setErrMsg('Request failed. Check your connection.')
      setState('error')
    }
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(liveUrl)
    setCopyOk(true)
    setTimeout(() => setCopyOk(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px', margin: '0 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <Label style={{ display: 'block', marginBottom: '0.5rem' }}>DEPLOY TO CLOUDFLARE PAGES</Label>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>Go live</h3>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
              → <span style={{ color: 'var(--accent)' }}>{slug}.pages.dev</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
        </div>

        <Rule style={{ marginBottom: '1.5rem' }} />

        {/* Idle */}
        {state === 'idle' && (
          <>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your site will be deployed to Cloudflare's global edge network and be live in under 30 seconds at:
              <br /><span style={{ color: 'var(--text)', fontWeight: 600 }}>{slug}.pages.dev</span>
            </p>
            <Btn variant="accent" fullWidth onClick={deploy}>▲ Deploy now</Btn>
          </>
        )}

        {/* Deploying */}
        {state === 'deploying' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', margin: '0 auto 1.5rem' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--border)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', borderTop: '1.5px solid var(--accent)', borderRight: '1.5px solid transparent', borderBottom: '1.5px solid transparent', borderLeft: '1.5px solid transparent', animation: 'spin 1s linear infinite' }} />
            </div>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Deploying…</p>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--muted)' }}>Uploading to Cloudflare's edge network</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', backgroundColor: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--success)', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
              <div>
                <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.15rem' }}>Live on Cloudflare Pages</p>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>Deployed to global edge — accessible worldwide</p>
              </div>
            </div>

            {/* URL row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {liveUrl}
              </div>
              <button onClick={copyUrl}
                style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.75rem', padding: '0 1rem', borderRadius: '8px', border: `1px solid ${copyOk ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`, backgroundColor: copyOk ? 'rgba(74,222,128,0.08)' : 'transparent', color: copyOk ? 'var(--success)' : 'var(--muted)', cursor: 'pointer', flexShrink: 0, transition: 'all 200ms' }}>
                {copyOk ? '✓' : '⎋ Copy'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={liveUrl} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                <Btn variant="accent" fullWidth>Open site ↗</Btn>
              </a>
              <Btn variant="ghost" onClick={onClose}>Done</Btn>
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--danger)', lineHeight: 1.5 }}>{errMsg}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Btn variant="accent" fullWidth onClick={deploy}>↺ Try again</Btn>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Builder view ─────────────────────────────────────────────────────────────
function BuilderView({ generatedCode, businessName, template, onReset, projectId, previewToken }: {
  generatedCode: string; businessName: string; template: string
  onReset: () => void; projectId: string | null; previewToken: string | null
}) {
  const wrapRef    = useRef<HTMLDivElement>(null)
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [device,      setDevice]      = useState<Device>('desktop')
  const [showDeploy,  setShowDeploy]  = useState(false)
  const [showChat,    setShowChat]    = useState(false)
  const [currentCode, setCurrentCode] = useState(generatedCode)
  const [chatLog,     setChatLog]     = useState<{ from: 'user' | 'ai'; text: string }[]>([])
  const [revInput,    setRevInput]    = useState('')
  const [isRevising,  setIsRevising]  = useState(false)
  const [revHistory,  setRevHistory]  = useState<{ role: string; content: string }[]>([])
  const [copyOk,      setCopyOk]      = useState(false)

  useEffect(() => { gsap.fromTo(wrapRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }) }, [])
  useEffect(() => {
    if (!iframeRef.current) return
    gsap.to(iframeRef.current, { width: DEVICE_WIDTHS[device], duration: 0.4, ease: 'power3.out' })
  }, [device])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatLog])

  const handleRevision = async () => {
    if (!revInput.trim() || isRevising) return
    const msg = revInput.trim()
    setRevInput('')
    setIsRevising(true)
    setChatLog(p => [...p, { from: 'user', text: msg }])
    try {
      const res  = await fetch('/api/revise', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentCode, revisionRequest: msg, history: revHistory }) })
      const data = await res.json()
      if (data.updatedCode) {
        setCurrentCode(data.updatedCode)
        setRevHistory(p => [...p, { role: 'user', content: msg }, { role: 'assistant', content: data.updatedCode }])
        setChatLog(p => [...p, { from: 'ai', text: '✓ Done — preview updated.' }])
      } else {
        setChatLog(p => [...p, { from: 'ai', text: 'Something went wrong. Try again.' }])
      }
    } catch {
      setChatLog(p => [...p, { from: 'ai', text: 'Request failed. Check your connection.' }])
    } finally { setIsRevising(false) }
  }

  const downloadHTML = () => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([currentCode], { type: 'text/html' })), download: `${businessName.toLowerCase().replace(/\s+/g, '-')}.html` })
    a.click()
  }

  const sharePreview = async () => {
    if (!previewToken) return
    await navigator.clipboard.writeText(`${window.location.origin}/preview/${previewToken}`)
    setCopyOk(true)
    setTimeout(() => setCopyOk(false), 2000)
  }

  const slug = businessName.toLowerCase().replace(/\s+/g, '')

  const DevBtn = ({ icon, d, active }: { icon: string; d: Device; active: boolean }) => (
    <button onClick={() => setDevice(d)}
      style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', backgroundColor: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--muted)', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </button>
  )

  return (
    <>
      <style>{FONTS}</style>
      <div ref={wrapRef} style={{ opacity: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)' }}>
        {/* Topbar */}
        <div style={{ height: '52px', flexShrink: 0, borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(5,5,5,0.96)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.75rem', zIndex: 50 }}>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.25rem', letterSpacing: '0.04em', flexShrink: 0 }}>NOV<span style={{ color: 'var(--accent)' }}>UX</span></span>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{businessName}</span>
            <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--accent)', backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', padding: '0.15rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>{template.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--surface)', borderRadius: '8px', padding: '3px' }}>
            <DevBtn icon="🖥" d="desktop" active={device === 'desktop'} />
            <DevBtn icon="⬜" d="tablet"  active={device === 'tablet'}  />
            <DevBtn icon="📱" d="mobile"  active={device === 'mobile'}  />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Btn variant="ghost" size="sm" onClick={onReset}>↺ Rebuild</Btn>
            <Btn variant="ghost" size="sm" onClick={downloadHTML}>↓ HTML</Btn>
            <button onClick={sharePreview}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.75rem', padding: '0.4rem 0.875rem', borderRadius: '8px', border: `1px solid ${copyOk ? 'rgba(100,220,130,0.3)' : 'var(--border)'}`, backgroundColor: copyOk ? 'rgba(100,220,130,0.08)' : 'transparent', color: copyOk ? '#6ddc82' : 'var(--muted)', cursor: 'pointer', transition: 'all 200ms' }}>
              {copyOk ? '✓ Copied' : '⎋ Share'}
            </button>
            <button onClick={() => setShowChat(v => !v)}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.75rem', padding: '0.4rem 0.875rem', borderRadius: '8px', border: `1px solid ${showChat ? 'var(--accent-mid)' : 'var(--border)'}`, backgroundColor: showChat ? 'var(--accent-dim)' : 'transparent', color: showChat ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', transition: 'all 200ms' }}>
              ✦ Revise
            </button>
            <Btn variant="accent" size="sm" onClick={() => setShowDeploy(true)}>▲ Deploy</Btn>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#030303', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexShrink: 0, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['rgba(255,80,80,0.4)', 'rgba(255,190,50,0.4)', 'rgba(80,200,80,0.4)'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />)}
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '5px', padding: '0.2rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.55rem', color: 'var(--accent)', opacity: 0.6 }}>🔒</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted)' }}>{slug}.novux.app</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: device !== 'desktop' ? '2rem 0' : 0 }}>
              <iframe ref={iframeRef} srcDoc={currentCode}
                style={{ width: DEVICE_WIDTHS[device], height: '100%', border: 'none', borderRadius: device !== 'desktop' ? '12px' : 0, boxShadow: device !== 'desktop' ? '0 24px 80px rgba(0,0,0,0.8)' : 'none', transition: 'border-radius 300ms' }}
                title="Preview" />
            </div>
          </div>

          {showChat && (
            <div style={{ width: '340px', flexShrink: 0, borderLeft: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <Label style={{ display: 'block', marginBottom: '0.25rem' }}>AI REVISION</Label>
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--muted)' }}>Tell the AI what to change</p>
                </div>
                <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatLog.length === 0 && (
                  <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--f-label)', fontSize: '3rem', color: 'var(--border2)', marginBottom: '1rem' }}>✦</p>
                    <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                      "Make the hero darker"<br />"Add a pricing section"<br />"Change font to serif"<br />"Rewrite copy for lawyers"
                    </p>
                  </div>
                )}
                {chatLog.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '88%', padding: '0.6rem 0.875rem', borderRadius: m.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', backgroundColor: m.from === 'user' ? 'var(--accent)' : 'var(--surface2)', color: m.from === 'user' ? '#000' : 'var(--text)', fontFamily: 'var(--f-body)', fontSize: '0.8rem', lineHeight: 1.5, border: m.from === 'ai' ? '1px solid var(--border)' : 'none' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isRevising && (
                  <div style={{ display: 'flex', gap: '5px', padding: '0.75rem 1rem', backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px 10px 10px 2px', width: 'fit-content' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '0.875rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <textarea value={revInput} onChange={e => setRevInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRevision() } }}
                    placeholder="Describe the change…" rows={2}
                    style={{ flex: 1, backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: 'var(--text)', fontSize: '0.8rem', outline: 'none', resize: 'none', fontFamily: 'var(--f-body)', lineHeight: 1.5, transition: 'border-color 200ms' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e  => (e.target.style.borderColor = 'var(--border)')} />
                  <button onClick={handleRevision} disabled={!revInput.trim() || isRevising}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', flexShrink: 0, backgroundColor: revInput.trim() && !isRevising ? 'var(--accent)' : 'var(--accent-dim)', color: revInput.trim() && !isRevising ? '#000' : 'rgba(232,255,71,0.3)', cursor: revInput.trim() && !isRevising ? 'pointer' : 'not-allowed', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}>↑</button>
                </div>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.4rem', textAlign: 'center', opacity: 0.5 }}>Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeploy && (
        <DeployModal
          businessName={businessName}
          html={currentCode}
          projectId={projectId}
          onClose={() => setShowDeploy(false)}
        />
      )}
    </>
  )
}

// ─── Main builder page ────────────────────────────────────────────────────────
export default function BuilderPage() {
  const params       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const template     = params.template as string

  const TOTAL_STEPS = 6

  const [step,           setStep]           = useState(() => searchParams.get('business_name') ? 2 : 1)
  const [businessName,   setBusinessName]   = useState(searchParams.get('business_name') ?? '')
  const [offering,       setOffering]       = useState('')
  const [city,           setCity]           = useState(searchParams.get('city') ?? '')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [goal,           setGoal]           = useState('')
  const [brandFeel,      setBrandFeel]      = useState('')
  const [variations,     setVariations]     = useState<string[]>([])
  const [generatedCode,  setGeneratedCode]  = useState('')
  const [currentState,   setCurrentState]   = useState<object | null>(null)
  const [readyCount,     setReadyCount]     = useState(0)
  const [isError,        setIsError]        = useState(false)
  const [errorMessage,   setErrorMessage]   = useState('')
  const [projectId,      setProjectId]      = useState<string | null>(null)
  const [previewToken,   setPreviewToken]   = useState<string | null>(null)

  const navRef = useRef<HTMLElement>(null)
  useEffect(() => { gsap.fromTo(navRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }) }, [])

  const generateOne = async (): Promise<{ html: string; state: object }> => {
    const { data: { session } } = await supabase.auth.getSession()
    const res  = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ businessName, offering, city, targetCustomer, goal, brandFeel, template }),
    })
    const data = await res.json()
    if (res.status === 403 && data.error === 'limit_reached') throw new Error(data.message)
    setReadyCount(p => p + 1)
    return { html: data.html, state: data.state }
  }
  

  const handleGenerate = async () => {
    setIsError(false); setStep(7); setReadyCount(0)
    try {
      const results = await Promise.all([generateOne(), generateOne()])
      setVariations(results.map(r => r.html))
      setCurrentState(results[0].state)
      setStep(8)
    } catch (err: any) {
      console.error(err); setIsError(true); setStep(6)
      if (err?.message) setErrorMessage(err.message)
    }
  }

  const handlePick = async (html: string) => {
    setGeneratedCode(html); setStep(9)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const res   = await fetch('/api/projects/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: businessName, city, template, html, state: currentState, userId: session.user.id, offering, targetCustomer, goal, brandFeel }) })
      const saved = await res.json()
      if (saved.project?.id)            setProjectId(saved.project.id)
      if (saved.project?.preview_token) setPreviewToken(saved.project.preview_token)
    } catch (err) { console.error('Save failed silently:', err) }
  }

  const handleReset = () => {
    setStep(1); setGeneratedCode(''); setVariations([]); setBusinessName(''); setOffering(''); setCity(''); setTargetCustomer(''); setGoal(''); setBrandFeel(''); setCurrentState(null); setReadyCount(0); setIsError(false); setProjectId(null); setPreviewToken(null)
  }

  if (step === 9 && generatedCode)           return <><style>{FONTS}</style><BuilderView generatedCode={generatedCode} businessName={businessName} template={template} onReset={handleReset} projectId={projectId} previewToken={previewToken} /></>
  if (step === 8 && variations.length === 2) return <><style>{FONTS}</style><VariationPicker variations={variations} onPick={handlePick} onRegenerate={handleGenerate} /></>
  if (step === 7)                            return <><style>{FONTS}</style><LoadingView count={readyCount} /></>

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>
      <nav ref={navRef} style={{ position: 'sticky', top: 0, zIndex: 50, opacity: 0, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.9)' }}>
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em', cursor: 'pointer' }} onClick={() => router.push('/')}>
          NOV<span style={{ color: 'var(--accent)' }}>UX</span>
        </span>
        <Btn variant="ghost" size="sm" onClick={() => router.push('/templates')}>← Templates</Btn>
      </nav>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '5rem 2rem 10rem' }}>
        {step <= TOTAL_STEPS && <StepRail current={step} total={TOTAL_STEPS} />}

        {step === 1 && (
          <StepPanel stepNum={1}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>BUSINESS NAME</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>What's your<br />business called?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>This appears throughout your website — headers, footers, metadata.</p>
            </div>
            <Input autoFocus value={businessName} onChange={setBusinessName} onKeyDown={e => e.key === 'Enter' && businessName && setStep(2)} placeholder="e.g. Nova Studio, John's Bakery, Pulse Agency…" />
            <Btn variant="accent" size="lg" fullWidth disabled={!businessName} onClick={() => setStep(2)}>Continue →</Btn>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel stepNum={2}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>YOUR OFFERING</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>What do<br />you offer?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Products, services, skills — be as specific as you like.</p>
            </div>
            <Textarea value={offering} onChange={setOffering} placeholder="e.g. Premium haircuts and beard grooming for men. Walk-ins welcome, card payments accepted…" rows={4} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Btn variant="ghost" size="lg" fullWidth onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="accent" size="lg" fullWidth disabled={!offering} onClick={() => setStep(3)}>Continue →</Btn>
            </div>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel stepNum={3}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>LOCATION</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>Where are<br />you based?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>The AI writes copy that resonates with your local market.</p>
            </div>
            <Input autoFocus value={city} onChange={setCity} onKeyDown={e => e.key === 'Enter' && city && setStep(4)} placeholder="e.g. Lagos, London, Dubai, New York…" />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Btn variant="ghost" size="lg" fullWidth onClick={() => setStep(2)}>← Back</Btn>
              <Btn variant="accent" size="lg" fullWidth disabled={!city} onClick={() => setStep(4)}>Continue →</Btn>
            </div>
          </StepPanel>
        )}

        {step === 4 && (
          <StepPanel stepNum={4}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>TARGET CUSTOMER</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>Who's your<br />customer?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>The AI tailors every design decision and line of copy to them.</p>
            </div>
            <Input autoFocus value={targetCustomer} onChange={setTargetCustomer} onKeyDown={e => e.key === 'Enter' && targetCustomer && setStep(5)} placeholder="e.g. Young professionals aged 25–40 looking for premium grooming…" />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Btn variant="ghost" size="lg" fullWidth onClick={() => setStep(3)}>← Back</Btn>
              <Btn variant="accent" size="lg" fullWidth disabled={!targetCustomer} onClick={() => setStep(5)}>Continue →</Btn>
            </div>
          </StepPanel>
        )}

        {step === 5 && (
          <StepPanel stepNum={5}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>PRIMARY GOAL</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>What's the<br />main goal?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Shapes the layout, call-to-actions, and copywriting structure.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Get calls & enquiries',    sub: 'Phone CTA, contact forms, hours' },
                { label: 'Sell products online',      sub: 'Product grid, cart, checkout flow' },
                { label: 'Build trust & credibility', sub: 'Testimonials, credentials, about' },
                { label: 'Showcase my work',          sub: 'Portfolio grid, case studies' },
              ].map(opt => <SelectCard key={opt.label} label={opt.label} sub={opt.sub} active={goal === opt.label} onClick={() => setGoal(opt.label)} />)}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Btn variant="ghost" size="lg" fullWidth onClick={() => setStep(4)}>← Back</Btn>
              <Btn variant="accent" size="lg" fullWidth disabled={!goal} onClick={() => setStep(6)}>Continue →</Btn>
            </div>
          </StepPanel>
        )}

        {step === 6 && (
          <StepPanel stepNum={6}>
            <div>
              <Label style={{ display: 'block', marginBottom: '1rem' }}>BRAND FEEL</Label>
              <Rule style={{ marginBottom: '1.75rem' }} />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.25rem,6vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1rem' }}>What's your<br />brand feel?</h2>
              <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Sets the visual tone — typography, color palette, motion style.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Bold & powerful',          sub: 'Heavy type, strong contrast, energy' },
                { label: 'Minimal & clean',          sub: 'Whitespace, restraint, clarity' },
                { label: 'Elegant & premium',        sub: 'Refined, serif, considered luxury' },
                { label: 'Playful & friendly',       sub: 'Warm, rounded, approachable' },
                { label: 'Professional & corporate', sub: 'Trustworthy, structured, formal' },
              ].map(opt => <SelectCard key={opt.label} label={opt.label} sub={opt.sub} active={brandFeel === opt.label} onClick={() => setBrandFeel(opt.label)} />)}
            </div>
            {isError && (
              <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.18)', borderRadius: '10px' }}>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--danger)' }}>{errorMessage || 'Generation failed. Check your API credits and try again.'}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Btn variant="ghost" size="lg" fullWidth onClick={() => setStep(5)}>← Back</Btn>
              <Btn variant="accent" size="lg" fullWidth disabled={!brandFeel} onClick={handleGenerate}>Generate 2 Variations ✦</Btn>
            </div>
          </StepPanel>
        )}
      </main>
    </div>