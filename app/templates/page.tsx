'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const templates = [
  { id: 'agency',     name: 'Agency',      description: 'Perfect for creative agencies and studios',  category: 'Business',     color: '#C8FF00', popular: true  },
  { id: 'restaurant', name: 'Restaurant',  description: 'Beautiful menus and reservation layouts',    category: 'Food',         color: '#FF6B35', popular: false },
  { id: 'portfolio',  name: 'Portfolio',   description: 'Showcase your work with style',              category: 'Creative',     color: '#A855F7', popular: false },
  { id: 'saas',       name: 'SaaS',        description: 'Convert visitors into customers',            category: 'Tech',         color: '#3B82F6', popular: true  },
  { id: 'ecommerce',  name: 'E-Commerce',  description: 'Sell products with a premium storefront',   category: 'Store',        color: '#EC4899', popular: false },
  { id: 'blog',       name: 'Blog',        description: 'Share your ideas with the world',            category: 'Content',      color: '#F59E0B', popular: false },
  { id: 'realestate', name: 'Real Estate', description: 'List and sell properties beautifully',      category: 'Business',     color: '#10B981', popular: false },
  { id: 'startup',    name: 'Startup',     description: 'Launch your idea with impact',              category: 'Tech',         color: '#C8FF00', popular: false },
  { id: 'nonprofit',  name: 'Non-Profit',  description: 'Inspire action and raise awareness',        category: 'Organization', color: '#EF4444', popular: false },
]

const CATEGORIES = ['All', ...Array.from(new Set(templates.map(t => t.category)))]

/* ── Template Card ───────────────────────────────────────────── */
function TemplateCard({ template, index }: { template: typeof templates[0]; index: number }) {
  const ref    = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
          delay: (index % 3) * 0.07,
          scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none none' },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [index])

  const onEnter = () => {
    if (!ref.current) return
    gsap.to(ref.current, { y: -4, duration: 0.3, ease: 'power2.out' })
    ref.current.style.borderColor = `${template.color}40`
    ref.current.style.backgroundColor = '#141414'
  }

  const onLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { y: 0, duration: 0.4, ease: 'power2.out' })
    ref.current.style.borderColor = 'rgba(255,255,255,0.07)'
    ref.current.style.backgroundColor = '#111111'
  }

  return (
    <button ref={ref} onClick={() => router.push(`/builder/${template.id}`)}
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ opacity: 0, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', textAlign: 'left', cursor: 'pointer', transition: 'border-color 250ms, background-color 250ms', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Preview block */}
      <div style={{ width: '100%', height: '130px', borderRadius: '14px', background: `${template.color}0d`, border: `1px solid ${template.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Cross lines */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: `${template.color}15` }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: `${template.color}15` }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '3rem', fontWeight: 900, color: template.color, position: 'relative', zIndex: 1 }}>
          {template.name.charAt(0)}
        </span>
        {/* Popular badge */}
        {template.popular && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000000', backgroundColor: '#C8FF00', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
            Popular
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>{template.name}</h3>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.25rem 0.625rem', borderRadius: '99px', backgroundColor: `${template.color}14`, color: template.color }}>
            {template.category}
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{template.description}</p>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8125rem', fontWeight: 700, color: template.color }}>Use template</span>
        <span style={{ color: template.color, fontSize: '1rem' }}>→</span>
      </div>
    </button>
  )
}

/* ── Filter Pill ─────────────────────────────────────────────── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
        letterSpacing: '0.02em', padding: '0.4rem 1rem', borderRadius: '99px',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer', transition: 'all 200ms',
        backgroundColor: active ? '#C8FF00' : 'transparent',
        color: active ? '#000000' : 'rgba(255,255,255,0.45)',
      }}>
      {label}
    </button>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function TemplatesPage() {
  const router    = useRouter()
  const navRef    = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,    { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' })
      gsap.fromTo(headerRef.current, { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out', delay: 0.15 })
      gsap.fromTo(filterRef.current, { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out', delay: 0.25 })
    })
    return () => ctx.revert()
  }, [])

  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>

      {/* Navbar */}
      <nav ref={navRef} style={{ position: 'sticky', top: 0, zIndex: 50, opacity: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.125rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', backgroundColor: 'rgba(10,10,10,0.88)' }}>
        <h1 onClick={() => router.push('/')} style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.375rem', fontWeight: 900, letterSpacing: '-0.03em', cursor: 'pointer' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <button onClick={() => router.push('/dashboard')}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          ← Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem 8rem' }}>

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '3rem', opacity: 0 }}>
          <div style={{ width: '36px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', margin: '0 auto 1.5rem' }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1rem' }}>
            Step 1 of 3
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '1rem' }}>
            Choose a <span style={{ color: '#C8FF00' }}>template</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
            Pick a starting point. AI will build your complete website in seconds.
          </p>
        </div>

        {/* Category filters */}
        <div ref={filterRef} style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          {CATEGORIES.map(cat => (
            <FilterPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((template, i) => (
            <TemplateCard key={template.id} template={template} index={i} />
          ))}
        </div>

        {/* Count */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '3rem' }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>

      </main>
    </div>
  )
}