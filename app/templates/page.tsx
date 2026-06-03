'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #050505;
    --surface:   #0f0f0f;
    --surface2:  #161616;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.12);
    --text:      #EFEFEF;
    --muted:     rgba(239,239,239,0.35);
    --accent:    #E8FF47;
    --accent-dim: rgba(232,255,71,0.07);
    --accent-mid: rgba(232,255,71,0.16);
    --f-display: 'Clash Display', sans-serif;
    --f-label:   'Bebas Neue', sans-serif;
    --f-body:    'Satoshi', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); }
  ::selection { background: var(--accent); color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
`

const templates = [
  { id: 'agency',     name: 'Agency',      description: 'Creative agencies and studios',         category: 'Business',     index: '01', popular: true  },
  { id: 'restaurant', name: 'Restaurant',  description: 'Menus, reservations, and atmosphere',   category: 'Food',         index: '02', popular: false },
  { id: 'portfolio',  name: 'Portfolio',   description: 'Showcase work with editorial style',    category: 'Creative',     index: '03', popular: false },
  { id: 'saas',       name: 'SaaS',        description: 'Convert visitors into customers',       category: 'Tech',         index: '04', popular: true  },
  { id: 'ecommerce',  name: 'E-Commerce',  description: 'Premium storefronts that sell',         category: 'Store',        index: '05', popular: false },
  { id: 'barbershop', name: 'Barbershop',  description: 'Sharp sites for grooming businesses',   category: 'Services',     index: '06', popular: true  },
  { id: 'pharmacy',   name: 'Pharmacy',    description: 'Trust-first layouts for health',        category: 'Health',       index: '07', popular: false },
  { id: 'law',        name: 'Law Firm',    description: 'Authority and credibility for legal',   category: 'Professional', index: '08', popular: false },
  { id: 'realestate', name: 'Real Estate', description: 'List and sell properties beautifully', category: 'Business',     index: '09', popular: false },
  { id: 'church',     name: 'Church',      description: 'Warm sites for faith communities',      category: 'Community',    index: '10', popular: false },
  { id: 'startup',    name: 'Startup',     description: 'Launch your idea with impact',          category: 'Tech',         index: '11', popular: false },
  { id: 'nonprofit',  name: 'Non-Profit',  description: 'Inspire action and raise awareness',    category: 'Community',    index: '12', popular: false },
]

const CATEGORIES = ['All', ...Array.from(new Set(templates.map(t => t.category)))]

const Rule = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
)

const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>
    {children}
  </span>
)

function TemplateCard({ template, prefill, cardIndex }: {
  template: typeof templates[0]
  prefill: { business_name: string; city: string }
  cardIndex: number
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.55, ease: 'power3.out',
          delay: (cardIndex % 4) * 0.06,
          scrollTrigger: { trigger: ref.current, start: 'top 92%', toggleActions: 'play none none none' },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [cardIndex])

  const handleClick = () => {
    const params = new URLSearchParams()
    if (prefill.business_name) params.set('business_name', prefill.business_name)
    if (prefill.city)          params.set('city',          prefill.city)
    const q = params.toString()
    router.push(`/builder/${template.id}${q ? `?${q}` : ''}`)
  }

  const onEnter = () => {
    if (!ref.current) return
    gsap.to(ref.current, { borderColor: 'rgba(232,255,71,0.25)', y: -4, duration: 0.3, ease: 'power2.out' })
    const arrow = ref.current.querySelector('.arrow') as HTMLElement
    if (arrow) gsap.to(arrow, { x: 4, duration: 0.25, ease: 'power2.out' })
  }
  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { borderColor: 'rgba(255,255,255,0.07)', y: 0, duration: 0.4, ease: 'power2.out' })
    const arrow = ref.current.querySelector('.arrow') as HTMLElement
    if (arrow) gsap.to(arrow, { x: 0, duration: 0.35, ease: 'power2.out' })
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        opacity: 0,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 250ms',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top row */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '2.5rem', color: 'var(--border2)', lineHeight: 1, userSelect: 'none' }}>
            {template.index}
          </span>
          <div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              {template.name}
            </h3>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              {template.description}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0, marginLeft: '1rem' }}>
          <Label style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.2rem 0.5rem' }}>
            {template.category.toUpperCase()}
          </Label>
          {template.popular && (
            <Label style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--accent)' }}>
              POPULAR
            </Label>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, minHeight: '120px', backgroundColor: 'var(--surface2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Center glyph */}
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '4.5rem', color: 'rgba(255,255,255,0.04)', userSelect: 'none', position: 'relative', zIndex: 1 }}>
          {template.name.toUpperCase().slice(0, 3)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)' }}>
          Use template
        </span>
        <span className="arrow" style={{ color: 'var(--accent)', fontSize: '1rem' }}>→</span>
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick, count }: {
  label: string; active: boolean; onClick: () => void; count: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--f-body)',
        fontSize: '0.78rem',
        fontWeight: 500,
        padding: '0.4rem 0.875rem',
        borderRadius: '6px',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--muted)',
        cursor: 'pointer',
        transition: 'all 180ms',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      {label}
      <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.65rem', opacity: 0.6 }}>{count}</span>
    </button>
  )
}

export default function TemplatesPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const navRef       = useRef<HTMLElement>(null)
  const heroRef      = useRef<HTMLDivElement>(null)
  const filterRef    = useRef<HTMLDivElement>(null)

  const [activeCategory, setActiveCategory] = useState('All')
  const [search,         setSearch]         = useState('')

  const prefill = {
    business_name: searchParams.get('business_name') ?? '',
    city:          searchParams.get('city')          ?? '',
  }
  const fromLeadFinder = !!prefill.business_name

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(navRef.current,    { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
      .fromTo(heroRef.current,   { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.2')
      .fromTo(filterRef.current, { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '-=0.25')
  }, [])

  const filtered = templates.filter(t => {
    const matchCat    = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const countFor = (cat: string) =>
    cat === 'All' ? templates.length : templates.filter(t => t.category === cat).length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ position: 'sticky', top: 0, zIndex: 50, opacity: 0, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.9)' }}>
        <span
          onClick={() => router.push('/')}
          style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em', cursor: 'pointer' }}
        >
          NOV<span style={{ color: 'var(--accent)' }}>UX</span>
        </span>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '5rem 2rem 10rem' }}>

        {/* ── Hero ── */}
        <div ref={heroRef} style={{ marginBottom: '4rem', opacity: 0 }}>

          {/* Lead Finder badge */}
          {fromLeadFinder && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', borderRadius: '6px', padding: '0.35rem 0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
              <Label style={{ color: 'var(--accent)' }}>
                BUILDING FOR {prefill.business_name.toUpperCase()}{prefill.city ? ` · ${prefill.city.toUpperCase()}` : ''}
              </Label>
            </div>
          )}

          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>STEP 1 OF 6 — CHOOSE A TEMPLATE</Label>
          <Rule style={{ marginBottom: '2rem' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.92, color: 'var(--text)' }}>
              Pick a<br />
              <span style={{ color: 'var(--accent)' }}>starting</span><br />
              point.
            </h1>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '260px', textAlign: 'right' }}>
              AI will build your complete website in seconds. The template shapes the structure — everything else is custom.
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div ref={filterRef} style={{ opacity: 0, marginBottom: '3rem' }}>
          <Rule style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates…"
                style={{ width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem 1rem 0.55rem 2.25rem', color: 'var(--text)', fontSize: '0.825rem', fontFamily: 'var(--f-body)', outline: 'none', transition: 'border-color 200ms' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <FilterPill
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  count={countFor(cat)}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>

            {/* Count */}
            <Label style={{ marginLeft: 'auto' }}>
              {filtered.length} TEMPLATE{filtered.length !== 1 ? 'S' : ''}
            </Label>
          </div>
          <Rule style={{ marginTop: '1.5rem' }} />
        </div>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'var(--border)' }}>
            {filtered.map((t, i) => (
              <div key={t.id} style={{ backgroundColor: 'var(--bg)' }}>
                <TemplateCard template={t} prefill={prefill} cardIndex={i} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '6rem 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-label)', fontSize: '4rem', color: 'var(--border2)', marginBottom: '1rem' }}>∅</p>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--muted)' }}>No templates match "{search}".</p>
          </div>
        )}
      </main>
    </div>
  )
}