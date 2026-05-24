'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import gsap from 'gsap'

/* ── Types ───────────────────────────────────────────────────── */
type Device = 'desktop' | 'tablet' | 'mobile'

/* ── Device dimensions ───────────────────────────────────────── */
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
    gsap.to(ref.current, {
      x: (e.clientX - r.left - r.width / 2) * 0.28,
      y: (e.clientY - r.top - r.height / 2) * 0.28,
      duration: 0.3, ease: 'power2.out',
    })
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
    variant === 'danger' ? { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } :
    { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <button ref={ref} onClick={disabled ? undefined : onClick}
      onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: fs,
        letterSpacing: '-0.01em', border: 'none', borderRadius: '10px',
        padding: pad, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, willChange: 'transform',
        transition: 'box-shadow 250ms, background-color 200ms',
        width: fullWidth ? '100%' : undefined,
        ...variantStyle,
      }}>
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

/* ── Loading Step ────────────────────────────────────────────── */
function LoadingStep() {
  const dotsRef = useRef<HTMLDivElement[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const lines   = ['✦ Designing layout', '✦ Writing copy', '✦ Optimizing performance']

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current.children,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, stagger: 0.18, delay: 0.4, duration: 0.4, ease: 'power2.out' }
      )
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
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C8FF00' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Building your site
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>AI is crafting your Awwwards-quality website</p>
      </div>
      <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center' }}>
        {lines.map((l) => <p key={l} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem', opacity: 0 }}>{l}</p>)}
      </div>
    </div>
  )
}

/* ── Device Toggle Button ────────────────────────────────────── */
function DeviceBtn({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px', borderRadius: '8px', border: 'none',
        cursor: 'pointer', fontSize: '0.9rem', transition: 'background 200ms, color 200ms',
        backgroundColor: active ? 'rgba(200,255,0,0.12)' : 'transparent',
        color: active ? '#C8FF00' : 'rgba(255,255,255,0.35)',
      }}>
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

  const slug = businessName.toLowerCase().replace(/\s+/g, '-')

  const platforms = [
    { name: 'Vercel',   icon: '▲', color: '#ffffff', desc: 'Deploy to Vercel — fastest global CDN',         action: () => alert('Vercel deploy coming soon') },
    { name: 'Netlify',  icon: '◆', color: '#00C7B7', desc: 'Deploy to Netlify — free tier available',       action: () => alert('Netlify deploy coming soon') },
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

/* ── Builder View (Step 4) ───────────────────────────────────── */
function BuilderView({
  generatedCode, businessName, template, onReset,
}: {
  generatedCode: string
  businessName: string
  template: string
  onReset: () => void
}) {
  const ref       = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [device, setDevice]       = useState<Device>('desktop')
  const [showDeploy, setShowDeploy] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
  }, [])

  /* Animate iframe width on device change */
  useEffect(() => {
    if (!iframeRef.current) return
    gsap.to(iframeRef.current, { width: DEVICE_WIDTHS[device], duration: 0.4, ease: 'power3.out' })
  }, [device])

  const downloadHTML = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-website.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadNextJS = () => {
    /* Wrap the HTML in a minimal Next.js page scaffold for export */
    const nextCode = `// Generated by Novux — paste into app/page.tsx
export default function Page() {
  return (
    <>
      <style>{\`${generatedCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? ''}\`}</style>
      <div dangerouslySetInnerHTML={{ __html: \`${generatedCode.replace(/`/g, '\\`')}\` }} />
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

        {/* ── Builder Topbar ── */}
        <div style={{
          height: '56px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(24px)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.25rem', gap: '1rem', zIndex: 50,
        }}>

          {/* Left — logo + site info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.03em', flexShrink: 0 }}>
              NOV<span style={{ color: '#C8FF00' }}>UX</span>
            </span>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {businessName}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C8FF00', backgroundColor: 'rgba(200,255,0,0.1)', padding: '0.15rem 0.45rem', borderRadius: '99px', flexShrink: 0 }}>
                {template}
              </span>
            </div>
          </div>

          {/* Center — device toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.25rem' }}>
            <DeviceBtn icon="🖥" label="Desktop" active={device === 'desktop'} onClick={() => setDevice('desktop')} />
            <DeviceBtn icon="📱" label="Tablet"  active={device === 'tablet'}  onClick={() => setDevice('tablet')}  />
            <DeviceBtn icon="📲" label="Mobile"  active={device === 'mobile'}  onClick={() => setDevice('mobile')}  />
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
            <MagneticBtn variant="ghost" size="sm" onClick={onReset}>↺ Rebuild</MagneticBtn>
            <MagneticBtn variant="ghost" size="sm" onClick={downloadHTML}>↓ HTML</MagneticBtn>
            <MagneticBtn variant="ghost" size="sm" onClick={downloadNextJS}>↓ Next.js</MagneticBtn>
            <MagneticBtn variant="accent" size="sm" onClick={() => setShowDeploy(true)}>▲ Deploy</MagneticBtn>
          </div>
        </div>

        {/* ── Preview Area ── */}
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#060606', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Browser chrome */}
          <div style={{ width: '100%', maxWidth: device === 'desktop' ? '100%' : DEVICE_WIDTHS[device], flexShrink: 0, backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

          {/* iframe wrapper */}
          <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: device !== 'desktop' ? '1.5rem 0' : '0' }}>
            <iframe
              ref={iframeRef}
              srcDoc={generatedCode}
              style={{
                width: DEVICE_WIDTHS[device],
                height: '100%',
                border: 'none',
                display: 'block',
                borderRadius: device !== 'desktop' ? '12px' : '0',
                boxShadow: device !== 'desktop' ? '0 16px 64px rgba(0,0,0,0.8)' : 'none',
                transition: 'border-radius 300ms',
              }}
              title="Generated Site Preview"
            />
          </div>
        </div>

      </div>

      {/* Deploy modal */}
      {showDeploy && <DeployModal businessName={businessName} onClose={() => setShowDeploy(false)} />}
    </>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function BuilderPage() {
  const params   = useParams()
  const router   = useRouter()
  const template = params.template as string

  const [step,                setStep]                = useState(1)
  const [businessName,        setBusinessName]        = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [generatedCode,       setGeneratedCode]       = useState('')
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
  }, [])

  const handleGenerate = async () => {
    if (!businessName) return
    setStep(3)
    try {
      const res  = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessDescription, template }),
      })
      const data = await res.json()
      setGeneratedCode(data.html)
      setStep(4)
    } catch (err) {
      console.error(err)
      setStep(2)
    }
  }

  const handleReset = () => {
    setStep(1)
    setGeneratedCode('')
    setBusinessName('')
    setBusinessDescription('')
  }

  /* Step 4 takes over the full viewport — render outside normal layout */
  if (step === 4 && generatedCode) {
    return (
      <BuilderView
        generatedCode={generatedCode}
        businessName={businessName}
        template={template}
        onReset={handleReset}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>

      {/* Navbar */}
      <nav ref={headerRef} style={{
        position: 'sticky', top: 0, zIndex: 50, opacity: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1.125rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(24px)', backgroundColor: 'rgba(10,10,10,0.88)',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', cursor: 'pointer' }}
          onClick={() => router.push('/')}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <MagneticBtn variant="ghost" onClick={() => router.push('/templates')}>← Templates</MagneticBtn>
      </nav>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '5rem 2rem 8rem' }}>

        {(step === 1 || step === 2) && <ProgressBar current={step} total={2} />}

        {/* Step 1 — Business name */}
        {step === 1 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 1 of 2</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                What's your<br />business called?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>This will be used throughout your website.</p>
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

        {/* Step 2 — Business description */}
        {step === 2 && (
          <StepPanel>
            <div>
              <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
              <p style={{ color: '#C8FF00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Step 2 of 2</p>
              <h2 style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontFamily: "'Syne',sans-serif", fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                Describe your<br />business
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>The more detail you give, the better your site will be.</p>
            </div>
            <textarea autoFocus value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="e.g. We are a creative agency specializing in brand identity and digital experiences…"
              rows={5}
              onFocus={(e) => (e.target.style.borderColor = '#C8FF00')}
              onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              style={{ width: '100%', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', color: '#ffffff', fontSize: '1.0625rem', outline: 'none', resize: 'none', fontFamily: "'Inter',sans-serif", lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 200ms' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MagneticBtn variant="ghost" fullWidth size="lg" onClick={() => setStep(1)}>← Back</MagneticBtn>
              <MagneticBtn variant="accent" fullWidth size="lg" onClick={handleGenerate}>Generate My Site ✦</MagneticBtn>
            </div>
          </StepPanel>
        )}

        {/* Step 3 — Loading */}
        {step === 3 && <LoadingStep />}

      </main>
    </div>
  )
}