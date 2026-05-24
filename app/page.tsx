'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBreakpoint } from '@/lib/useBreakpoint'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/* ── Magnetic Button ─────────────────────────────────────────── */
function MagneticBtn({
  children, onClick, variant = 'accent', size = 'lg',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.3, ease: 'power2.out' })
  }
  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
    ref.current.style.boxShadow = 'none'
    if (variant === 'ghost') ref.current.style.backgroundColor = 'transparent'
  }
  const onEnter = () => {
    if (!ref.current) return
    if (variant === 'accent') ref.current.style.boxShadow = '0 0 32px rgba(200,255,0,0.35)'
    else ref.current.style.backgroundColor = 'rgba(255,255,255,0.06)'
  }

  const pad = size === 'xl' ? '1.125rem 2.5rem' : size === 'lg' ? '0.875rem 2rem' : size === 'sm' ? '0.4rem 1rem' : '0.65rem 1.5rem'
  const fs  = size === 'xl' ? '1.125rem' : size === 'lg' ? '1rem' : size === 'sm' ? '0.78rem' : '0.875rem'

  return (
    <button ref={ref} onClick={onClick} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: fs, letterSpacing: '-0.01em', border: 'none', borderRadius: '12px', padding: pad, cursor: 'pointer', willChange: 'transform', transition: 'box-shadow 250ms, background-color 200ms', ...(variant === 'accent' ? { backgroundColor: '#C8FF00', color: '#000000' } : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }) }}>
      {children}
    </button>
  )
}

/* ── Ticker ──────────────────────────────────────────────────── */
function Ticker() {
  const items = ['AI Website Builder', 'Awwwards Quality', 'One Click Deploy', 'Zero Code Needed', 'Built in Seconds', 'SEO Optimised', 'Your Vision. Instant.']
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0', backgroundColor: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', gap: '3rem', animation: 'ticker 20s linear infinite', width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#C8FF00', fontSize: '0.5rem' }}>✦</span>
            {item}
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  )
}

/* ── Feature Card ────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay, scrollTrigger: { trigger: ref.current, start: 'top 88%' } })
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', transition: 'all 300ms', cursor: 'default' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,255,0,0.2)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(200,255,0,0.03)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#111111' }}>
      <div style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>{icon}</div>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.625rem', color: '#ffffff' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
    </div>
  )
}

/* ── Step Card ───────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay, scrollTrigger: { trigger: ref.current, start: 'top 88%' } })
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(200,255,0,0.1)', border: '1px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '0.875rem', color: '#C8FF00' }}>{num}</div>
      <div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: '#ffffff' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
      </div>
    </div>
  )
}

/* ── Pricing Card ────────────────────────────────────────────── */
function PricingCard({ plan, price, period, desc, features, accent, cta, onCta, delay }: {
  plan: string; price: string; period: string; desc: string
  features: string[]; accent: boolean; cta: string; onCta: () => void; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay, scrollTrigger: { trigger: ref.current, start: 'top 88%' } })
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: accent ? 'rgba(200,255,0,0.05)' : '#111111', border: `1px solid ${accent ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #C8FF00, transparent)' }} />}
      {accent && <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000000', backgroundColor: '#C8FF00', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>Most Popular</div>}
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? '#C8FF00' : 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>{plan}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#ffffff' }}>{price}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>{period}</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
        {features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ color: '#C8FF00', fontSize: '0.75rem', flexShrink: 0 }}>✓</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={onCta}
        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: accent ? 'none' : '1px solid rgba(255,255,255,0.1)', backgroundColor: accent ? '#C8FF00' : 'transparent', color: accent ? '#000000' : 'rgba(255,255,255,0.7)', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'opacity 200ms' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
        {cta}
      </button>
    </div>
  )
}

/* ── Testimonial Card ────────────────────────────────────────── */
function TestimonialCard({ quote, name, role, delay }: { quote: string; name: string; role: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay, scrollTrigger: { trigger: ref.current, start: 'top 88%' } })
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[0,1,2,3,4].map(i => <span key={i} style={{ color: '#C8FF00', fontSize: '0.75rem' }}>★</span>)}
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic' }}>"{quote}"</p>
      <div>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>{name}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>{role}</p>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  const router                      = useRouter()
  const { isMobile, isTablet }      = useBreakpoint()
  const [mounted, setMounted]       = useState(false)   // ← FIX: hydration guard
  const heroRef                     = useRef<HTMLDivElement>(null)
  const tagRef                      = useRef<HTMLParagraphElement>(null)
  const h1Ref                       = useRef<HTMLHeadingElement>(null)
  const subRef                      = useRef<HTMLParagraphElement>(null)
  const ctaRef                      = useRef<HTMLDivElement>(null)
  const navRef                      = useRef<HTMLElement>(null)
  const [mouse, setMouse]           = useState({ x: 50, y: 50 })
  const [menuOpen, setMenuOpen]     = useState(false)

  // ← FIX: only read breakpoints after client mount
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(navRef.current,  { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .fromTo(tagRef.current,  { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .fromTo(h1Ref.current,   { opacity: 0, y: 32  }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .fromTo(subRef.current,  { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .fromTo(ctaRef.current,  { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
  }, [])

  // Safe aliases — false on server, real value on client
  const mob = mounted && isMobile
  const tab = mounted && isTablet

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', overflowX: 'hidden' }}
      onMouseMove={(e) => !mob && setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })}>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: mob ? '1rem 1.25rem' : '1.25rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', backgroundColor: 'rgba(10,10,10,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: 0 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </span>

        {/* Desktop nav */}
        {!mob && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <MagneticBtn variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>Sign In</MagneticBtn>
            <MagneticBtn variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>Dashboard</MagneticBtn>
            <MagneticBtn variant="accent" size="md" onClick={() => router.push('/templates')}>Get Started →</MagneticBtn>
          </div>
        )}

        {/* Mobile nav */}
        {mob && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <MagneticBtn variant="accent" size="sm" onClick={() => router.push('/templates')}>Get Started</MagneticBtn>
            <button onClick={() => setMenuOpen(prev => !prev)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '1rem' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}

        {/* Mobile dropdown */}
        {mob && menuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'rgba(10,10,10,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => { router.push('/auth/login'); setMenuOpen(false) }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', textAlign: 'left', padding: '0.5rem 0' }}>
              Sign In
            </button>
            <button onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', textAlign: 'left', padding: '0.5rem 0' }}>
              Dashboard
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: mob ? '7rem 1.25rem 5rem' : '8rem 2rem 6rem', position: 'relative', overflow: 'hidden' }}>
        {!mob && (
          <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)', left: `${mouse.x}%`, top: `${mouse.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', transition: 'left 1s ease, top 1s ease' }} />
        )}
        {mob && (
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

        <p ref={tagRef} style={{ opacity: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1.5rem', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '99px', padding: '0.4rem 1rem', backgroundColor: 'rgba(200,255,0,0.06)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C8FF00', display: 'inline-block', animation: 'blink 2s ease infinite' }} />
          AI-Powered Web Builder
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </p>

        <h1 ref={h1Ref} style={{ opacity: 0, fontFamily: "'Syne', sans-serif", fontSize: mob ? 'clamp(2.5rem, 12vw, 4rem)' : 'clamp(3rem, 10vw, 7rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: '1.5rem', maxWidth: '900px' }}>
          Your website.<br /><span style={{ color: '#C8FF00' }}>Built in seconds.</span>
        </h1>

        <p ref={subRef} style={{ opacity: 0, fontFamily: "'Inter', sans-serif", fontSize: mob ? '1rem' : 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2.5rem' }}>
          Describe your business. Pick a style. Watch AI build you an Awwwards-quality website in under 30 seconds.
        </p>

        <div ref={ctaRef} style={{ opacity: 0, display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', width: mob ? '100%' : 'auto' }}>
          <MagneticBtn variant="accent" size={mob ? 'lg' : 'xl'} onClick={() => router.push('/templates')}>Build My Site ✦</MagneticBtn>
          {!mob && <MagneticBtn variant="ghost" size="xl" onClick={() => router.push('/dashboard')}>View Dashboard →</MagneticBtn>}
        </div>

        <p style={{ marginTop: '2.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
          {mob ? 'Free to try · 30-second builds' : 'No credit card required · Free to try · 30-second builds'}
        </p>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Features ── */}
      <section style={{ padding: mob ? '5rem 1.25rem' : '8rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: mob ? '2.5rem' : '4rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>Why Novux</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <FeatureCard delay={0}   icon="⚡" title="Instant Generation"  desc="AI builds your complete website in under 30 seconds. Full HTML, CSS, and animations included." />
          <FeatureCard delay={0.1} icon="✦"  title="Awwwards Quality"   desc="Every site is designed to impress. Not templates — unique, tailor-made designs for your brand." />
          <FeatureCard delay={0.2} icon="📱" title="Fully Responsive"    desc="Looks perfect on every screen. Mobile, tablet, desktop — your site adapts automatically." />
          <FeatureCard delay={0.3} icon="▲"  title="One-Click Deploy"   desc="Deploy to Netlify in one click. Your site goes live in seconds, no setup needed." />
          <FeatureCard delay={0.4} icon="🎨" title="10+ Templates"       desc="Start from a style that fits your business. Agency, restaurant, portfolio, SaaS, and more." />
          <FeatureCard delay={0.5} icon="🔍" title="SEO Ready"           desc="Built-in meta tags, semantic HTML, and performance optimisation baked into every generation." />
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: mob ? '4rem 1.25rem' : '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: tab ? '1fr' : '1fr 1fr', gap: tab ? '3rem' : '5rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>How it works</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '2.5rem' }}>
              Three steps.<br />One great site.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <StepCard delay={0}   num="01" title="Pick a style"      desc="Choose from 10+ curated templates that match your business vibe." />
              <StepCard delay={0.1} num="02" title="Describe yourself" desc="Tell us your business name and what you do. The more detail, the better." />
              <StepCard delay={0.2} num="03" title="Deploy & launch"   desc="Your site is ready in seconds. Deploy to Netlify in one click." />
            </div>
          </div>

          {/* Preview card — hide on mobile */}
          {!mob && (
            <div style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ backgroundColor: '#0f0f0f', padding: '0.75rem 1rem', display: 'flex', gap: '0.4rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.5)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(234,179,8,0.5)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.5)' }} />
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>yoursite.novux.app</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', background: 'linear-gradient(180deg, rgba(200,255,0,0.04) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '60px', height: '8px', backgroundColor: '#C8FF00', borderRadius: '4px', opacity: 0.7 }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[40, 50, 40].map((w, i) => <div key={i} style={{ width: `${w}px`, height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />)}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ height: '14px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '6px', width: '75%', marginBottom: '0.5rem' }} />
                  <div style={{ height: '14px', backgroundColor: 'rgba(200,255,0,0.4)', borderRadius: '6px', width: '55%', marginBottom: '1rem' }} />
                  <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '3px', width: '90%', marginBottom: '0.375rem' }} />
                  <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '3px', width: '70%', marginBottom: '1rem' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ height: '32px', backgroundColor: '#C8FF00', borderRadius: '8px', width: '110px' }} />
                    <div style={{ height: '32px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', width: '90px', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[0,1,2].map(i => <div key={i} style={{ height: '52px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: mob ? '4rem 1.25rem' : '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>Testimonials</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Real businesses.<br />Real results.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <TestimonialCard delay={0}   quote="I had a full agency site live in under a minute. The design quality is insane — my clients thought I hired a studio." name="Amara O." role="Creative Director, Lagos" />
          <TestimonialCard delay={0.1} quote="Set up my restaurant's website in 30 seconds. Looks better than the $2,000 site I paid for last year." name="Chidi N." role="Owner, Chidi's Kitchen" />
          <TestimonialCard delay={0.2} quote="As a developer I was skeptical. But the code it outputs is actually clean. Saved me 3 days of work." name="Fatima A." role="Full-Stack Developer" />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: mob ? '4rem 1.25rem 6rem' : '6rem 2rem 8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>Pricing</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Simple, honest pricing.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start' }}>
            <PricingCard delay={0}   plan="Starter" price="Free" period=""          desc="Perfect for trying Novux out."                        accent={false} cta="Get Started Free" onCta={() => router.push('/templates')} features={['3 site generations', '5 templates', 'HTML download', 'Basic SEO']} />
            <PricingCard delay={0.1} plan="Pro"     price="$29"  period="/mo"       desc="For businesses serious about their web presence."     accent={true}  cta="Start Pro →"      onCta={() => router.push('/templates')} features={['Unlimited generations', 'All 10+ templates', 'One-click deploy', 'AI SEO Auditor', 'Priority support', 'Custom domain']} />
            <PricingCard delay={0.2} plan="Build"   price="$150" period=" one-time" desc="We build it for you. Done-for-you service."           accent={false} cta="Book a Build"     onCta={() => router.push('/templates')} features={['Custom AI generation', 'Full code delivery', 'Revisions included', 'Deploy & launch', 'SEO setup', '30-day support']} />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: mob ? '3rem 1.25rem' : '5rem 2rem', margin: mob ? '0 1rem 4rem' : '0 auto 5rem', backgroundColor: '#111111', border: '1px solid rgba(200,255,0,0.15)', borderRadius: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden', maxWidth: '1100px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(200,255,0,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>Ready?</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
          Build your first site today.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', fontSize: mob ? '0.9rem' : '1rem', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          It takes 30 seconds. No code. No design skills. Just results.
        </p>
        <MagneticBtn variant="accent" size={mob ? 'lg' : 'xl'} onClick={() => router.push('/templates')}>Start Building ✦</MagneticBtn>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: mob ? '1.5rem 1.25rem' : '2rem 2.5rem', display: 'flex', flexDirection: mob ? 'column' : 'row', alignItems: mob ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </span>
        <div style={{ display: 'flex', gap: mob ? '1.5rem' : '2rem', alignItems: 'center' }}>
          {['Templates', 'Dashboard'].map(link => (
            <button key={link} onClick={() => router.push(`/${link.toLowerCase()}`)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              {link}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>
          © {new Date().getFullYear()} Novux. All rights reserved.
        </p>
      </footer>

    </div>
  )
}