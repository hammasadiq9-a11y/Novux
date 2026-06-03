'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
    --f-display:  'Clash Display', sans-serif;
    --f-label:    'Bebas Neue', sans-serif;
    --f-body:     'Satoshi', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); overflow-x: hidden; }
  ::selection { background: var(--accent); color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

  @keyframes marquee  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes blink    { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
`

const Rule = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
)

const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>
    {children}
  </span>
)

const STEPS = [
  { n: '01', title: 'Pick a template',     body: 'Choose from 12 industry-specific starting points. Barbershop. SaaS. Law firm. Restaurant.' },
  { n: '02', title: 'Fill your brief',     body: 'Six questions. Business name, location, offering, audience, goal, feel. Two minutes, tops.' },
  { n: '03', title: 'AI generates 2 sites', body: 'Two completely different layouts, copy, and animations built in parallel. Pick your favourite.' },
  { n: '04', title: 'Revise with chat',    body: 'Tell the AI what to change in plain English. "Darker hero." "Add a pricing section." Done.' },
  { n: '05', title: 'Deploy or download',  body: 'Go live on your domain or a Novux subdomain. Or download the HTML and hand it off.' },
]

const FEATURES = [
  { label: 'Real production code',  body: 'Single HTML file. CSS and JS embedded. No locked builders, no monthly fees to stay live.' },
  { label: 'GSAP animations',       body: 'Every site ships with cinematic scroll animations built in. Not templates. Custom-generated.' },
  { label: 'Cultural intelligence', body: 'The AI understands local markets. Lagos. Dubai. London. Copy that resonates where you are.' },
  { label: 'Lead Finder',           body: 'Find local businesses with no website. One click pre-fills the builder and builds the site.' },
  { label: 'AI revision chat',      body: 'Change anything after generation. No redesign. No rebuild. Just talk to the AI.' },
  { label: 'Client previews',       body: 'Share a private link with clients before deploying. Password-optional. No account needed.' },
]

const TICKER_ITEMS = ['Real Code', 'GSAP Animations', 'No Locked Builders', 'Your Domain', 'Lead Finder', 'AI Revision', 'Production Ready', 'Client Previews', '2 Variations', 'Cultural Intelligence']

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'Forever',
    features: ['3 lifetime generations', 'Preview & download only', 'No deploy', 'Community support'],
    cta: 'Get started',
    accent: false,
  },
  {
    name: 'Pro',
    price: '$49',
    sub: 'per month',
    features: ['Unlimited generations', 'Deploy to Novux subdomain', 'AI revision chat', 'Priority support'],
    cta: 'Start building',
    accent: true,
  },
  {
    name: 'Agency',
    price: '$99',
    sub: 'per month',
    features: ['Everything in Pro', 'Custom domain deploy', 'Client preview links', 'SiteIQ add-on access'],
    cta: 'Start building',
    accent: false,
  },
]

export default function LandingPage() {
  const router  = useRouter()
  const navRef  = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Nav
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
    )

    // Hero stagger
    if (heroRef.current) {
      const els = heroRef.current.querySelectorAll('[data-hero]')
      gsap.fromTo(els,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.25 }
      )
    }

    // Scroll-triggered sections
    document.querySelectorAll('[data-reveal]').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        }
      )
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, opacity: 0, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.88)' }}>
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em' }}>
          NOV<span style={{ color: 'var(--accent)' }}>UX</span>
        </span>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['How it works', 'Pricing', 'Lead Finder'].map(item => (
            <button key={item} style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              {item}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/auth')}
            style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/templates')}
            style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.825rem', padding: '0.5rem 1.25rem', borderRadius: '8px', backgroundColor: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', transition: 'opacity 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start building →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '6rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '1160px', margin: '0 auto', position: 'relative' }}>

        {/* Top label row */}
        <div data-hero style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', opacity: 0 }}>
          <Label>AI WEBSITE BUILDER</Label>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }} />
          <Label>PRODUCTION CODE — NOT LOCKED BUILDERS</Label>
        </div>

        {/* Headline */}
        <div data-hero style={{ opacity: 0, marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(4rem, 10vw, 9rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.9, color: 'var(--text)' }}>
            Your site,<br />
            <span style={{ color: 'var(--accent)' }}>built in</span><br />
            seconds.
          </h1>
        </div>

        {/* Subtext + CTA */}
        <div data-hero style={{ opacity: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'end', marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '420px' }}>
            Describe your business in six steps. Novux generates two complete, production-ready websites — real HTML, real animations, real copy — and hands you the code.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', alignItems: 'flex-start' }}>
            <button
              onClick={() => router.push('/templates')}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '1rem', padding: '0.875rem 2.25rem', borderRadius: '10px', backgroundColor: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', transition: 'opacity 200ms, transform 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Build your site for free →
            </button>
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>
              No card required · 3 free generations
            </span>
          </div>
        </div>

        <Rule data-hero style={{ opacity: 0 }} />

        {/* Stats row */}
        <div data-hero style={{ opacity: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', marginTop: '2.5rem' }}>
          {[
            { n: '12',     label: 'Industry templates' },
            { n: '2',      label: 'Variations per brief' },
            { n: '< 60s',  label: 'Generation time' },
            { n: '100%',   label: 'Real production code' },
          ].map((stat, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none', paddingRight: '2rem', paddingLeft: i > 0 ? '2rem' : 0 }}>
              <p style={{ fontFamily: 'var(--f-label)', fontSize: '2.75rem', color: 'var(--text)', lineHeight: 1 }}>{stat.n}</p>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ticker ── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
        <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily: 'var(--f-label)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--muted)', padding: '0 2.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              {item}
              <span style={{ color: 'var(--accent)', fontSize: '0.5rem' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '8rem 2.5rem' }}>
        <div data-reveal style={{ opacity: 0, marginBottom: '4rem' }}>
          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>HOW IT WORKS</Label>
          <Rule style={{ marginBottom: '2.5rem' }} />
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
            Five steps.<br />
            <span style={{ color: 'var(--accent)' }}>One complete site.</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} data-reveal style={{ opacity: 0 }}>
              <Rule />
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '2rem', padding: '2rem 0', alignItems: 'start' }}>
                <span style={{ fontFamily: 'var(--f-label)', fontSize: '3.5rem', color: 'var(--border2)', lineHeight: 1, userSelect: 'none' }}>{s.n}</span>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', paddingTop: '0.25rem' }}>{s.title}</h3>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            </div>
          ))}
          <Rule />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '8rem 2.5rem' }}>
          <div data-reveal style={{ opacity: 0, marginBottom: '4rem' }}>
            <Label style={{ display: 'block', marginBottom: '1.25rem' }}>WHAT YOU GET</Label>
            <Rule style={{ marginBottom: '2.5rem' }} />
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
              Built different.<br />
              <span style={{ color: 'var(--accent)' }}>On purpose.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'var(--border)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div key={i} data-reveal style={{ opacity: 0, backgroundColor: 'var(--surface)', padding: '2rem 2rem 2.5rem' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              >
                <Label style={{ display: 'block', marginBottom: '1.25rem' }}>{String(i + 1).padStart(2, '0')}</Label>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.875rem' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '8rem 2.5rem' }}>
        <div data-reveal style={{ opacity: 0, marginBottom: '4rem' }}>
          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>PRICING</Label>
          <Rule style={{ marginBottom: '2.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'end' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
              Simple.<br />
              <span style={{ color: 'var(--accent)' }}>Transparent.</span>
            </h2>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              Start free. No card required. Upgrade when you're ready to deploy and unlock unlimited builds.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {PRICING.map((plan, i) => (
            <div key={i} data-reveal style={{ opacity: 0, backgroundColor: plan.accent ? 'var(--accent-dim)' : 'var(--surface)', border: `1px solid ${plan.accent ? 'rgba(232,255,71,0.25)' : 'var(--border)'}`, borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.75rem', color: plan.accent ? 'var(--accent)' : 'var(--muted)' }}>{plan.name.toUpperCase()}</Label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-label)', fontSize: '3.5rem', lineHeight: 1, color: 'var(--text)' }}>{plan.price}</span>
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--muted)' }}>{plan.sub}</span>
                </div>
              </div>

              <Rule />

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <span style={{ color: plan.accent ? 'var(--accent)' : 'var(--muted)', fontSize: '0.7rem', marginTop: '0.2rem', flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/templates')}
                style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.875rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: plan.accent ? 'none' : '1px solid var(--border2)', backgroundColor: plan.accent ? 'var(--accent)' : 'transparent', color: plan.accent ? '#000' : 'var(--text)', cursor: 'pointer', transition: 'opacity 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '8rem 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div data-reveal style={{ opacity: 0 }}>
            <Label style={{ display: 'block', marginBottom: '1.25rem' }}>GET STARTED</Label>
            <Rule style={{ marginBottom: '2rem' }} />
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: '1.5rem' }}>
              Your first site<br />
              is <span style={{ color: 'var(--accent)' }}>free.</span>
            </h2>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              No credit card. No setup. Just pick a template, answer six questions, and watch Novux build two complete websites in under a minute.
            </p>
            <button
              onClick={() => router.push('/templates')}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '1rem', padding: '0.925rem 2.5rem', borderRadius: '10px', backgroundColor: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', transition: 'opacity 200ms, transform 200ms', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Build your site for free →
            </button>
          </div>

          {/* Right — feature list */}
          <div data-reveal style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              'Real production HTML — no locked builder',
              'GSAP animations on every site',
              'Two unique variations, every time',
              'AI revision chat after generation',
              'Deploy to your domain or Novux subdomain',
              'Lead Finder to find clients with no website',
            ].map((item, i) => (
              <div key={i}>
                <Rule />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.125rem 0' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '0.65rem', flexShrink: 0 }}>◆</span>
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)' }}>{item}</span>
                </div>
              </div>
            ))}
            <Rule />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 2.5rem' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
            NOV<span style={{ color: 'var(--accent)' }}>UX</span>
          </span>
          <Label>© {new Date().getFullYear()} NOVUX. ALL RIGHTS RESERVED.</Label>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy', 'Terms', 'Refunds'].map(item => (
              <button key={item} style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}