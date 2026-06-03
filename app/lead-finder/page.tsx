'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

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
    --f-display:  'Clash Display', sans-serif;
    --f-label:    'Bebas Neue', sans-serif;
    --f-body:     'Satoshi', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); }
  ::selection { background: var(--accent); color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
`

type Review = {
  author: string
  rating: number
  text:   string
  time:   number
}

type Lead = {
  id?:             string
  place_id:        string
  business_name:   string
  category:        string
  address:         string
  city:            string
  phone:           string
  rating:          number | null
  review_count:    number | null
  google_maps_url: string
  has_website:     boolean
  lead_status:     string
  reviews:         Review[]
  saved?:          boolean
}

const STATUS_COLORS: Record<string, string> = {
  new:       'var(--accent)',
  contacted: '#60a5fa',
  converted: '#4ade80',
  ignored:   'rgba(255,255,255,0.2)',
}

const Rule = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
)

const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>
    {children}
  </span>
)

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--accent)', fontSize: '0.7rem', letterSpacing: '1px' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

function ReviewsPanel({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return (
    <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
      No reviews fetched.
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.25rem' }}>
      {reviews.map((r, i) => (
        <div key={i} style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text)' }}>{r.author}</span>
            <Stars rating={r.rating} />
          </div>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.775rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            "{r.text}"
          </p>
        </div>
      ))}
    </div>
  )
}

function LeadCard({ lead, onSave, onSendToBuilder, onStatusChange }: {
  lead:            Lead
  onSave:          () => void
  onSendToBuilder: () => void
  onStatusChange:  (status: string) => void
}) {
  const [showReviews, setShowReviews] = useState(false)
  const reviewsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reviewsRef.current) return
    if (showReviews) {
      gsap.fromTo(reviewsRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.35, ease: 'power3.out' }
      )
    } else {
      gsap.to(reviewsRef.current, { opacity: 0, height: 0, duration: 0.25, ease: 'power2.in' })
    }
  }, [showReviews])

  return (
    <div style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 90px 200px', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>

        {/* Business info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {lead.business_name}
            </p>
            {!lead.has_website && (
              <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.58rem', letterSpacing: '0.1em', color: '#000', backgroundColor: 'var(--accent)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                NO SITE
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>
            {lead.category.replace(/_/g, ' ')} · {lead.address}
          </p>
          {lead.phone && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'rgba(239,239,239,0.2)', marginTop: '0.15rem' }}>
              {lead.phone}
            </p>
          )}
        </div>

        {/* Rating */}
        <div>
          {lead.rating ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                  {lead.rating}
                </span>
                <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>★</span>
              </div>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.68rem', color: 'var(--muted)' }}>
                {lead.review_count} reviews
              </p>
            </>
          ) : (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>—</p>
          )}
        </div>

        {/* Reviews toggle */}
        <div>
          {lead.reviews.length > 0 ? (
            <button
              onClick={() => setShowReviews(v => !v)}
              style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', fontWeight: 600, color: showReviews ? 'var(--accent)' : 'var(--muted)', background: 'none', border: `1px solid ${showReviews ? 'var(--accent-mid)' : 'var(--border)'}`, borderRadius: '6px', padding: '0.3rem 0.625rem', cursor: 'pointer', transition: 'all 200ms', backgroundColor: showReviews ? 'var(--accent-dim)' : 'transparent' }}
            >
              {showReviews ? '▲ Hide' : `▼ ${lead.reviews.length} reviews`}
            </button>
          ) : (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>No reviews</p>
          )}
        </div>

        {/* Status */}
        <select
          value={lead.lead_status}
          onChange={e => onStatusChange(e.target.value)}
          style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLORS[lead.lead_status] ?? 'var(--text)', backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', outline: 'none' }}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="ignored">Ignored</option>
        </select>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <a
            href={lead.google_maps_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontFamily: 'var(--f-body)', fontSize: '0.68rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Maps ↗
          </a>

          {!lead.saved ? (
            <button
              onClick={onSave}
              style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.625rem', cursor: 'pointer', transition: 'all 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              Save
            </button>
          ) : (
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: '#4ade80' }}>✓ Saved</span>
          )}

          {!lead.has_website && (
            <button
              onClick={onSendToBuilder}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 700, fontSize: '0.72rem', color: '#000', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.875rem', cursor: 'pointer', transition: 'opacity 200ms', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Build site →
            </button>
          )}
        </div>
      </div>

      {/* Reviews panel — animated */}
      <div ref={reviewsRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <div style={{ padding: '0 1.5rem 1.25rem' }}>
          <Rule style={{ marginBottom: '1rem' }} />
          <Label style={{ display: 'block', marginBottom: '0.75rem' }}>GOOGLE REVIEWS — WILL BE USED AS TESTIMONIALS IN THE GENERATED SITE</Label>
          <ReviewsPanel reviews={lead.reviews} />
        </div>
      </div>
    </div>
  )
}

export default function LeadFinderPage() {
  const router    = useRouter()
  const navRef    = useRef<HTMLElement>(null)
  const heroRef   = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const [businessType, setBusinessType] = useState('')
  const [city,         setCity]         = useState('')
  const [leads,        setLeads]        = useState<Lead[]>([])
  const [loading,      setLoading]      = useState(false)
  const [searched,     setSearched]     = useState(false)
  const [error,        setError]        = useState('')
  const [savedIds,     setSavedIds]     = useState<Set<string>>(new Set())

  useEffect(() => {
    gsap.fromTo(navRef.current,  { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
    gsap.fromTo(heroRef.current, { opacity: 0, y: 24  }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.1 })
  }, [])

  useEffect(() => {
    if (!resultRef.current || !searched) return
    gsap.fromTo(resultRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  }, [leads, searched])

  const handleSearch = async () => {
    if (!businessType.trim() || !city.trim()) return
    setLoading(true)
    setError('')
    setSearched(false)

    try {
      const res  = await fetch(`/api/leads/search?type=${encodeURIComponent(businessType)}&city=${encodeURIComponent(city)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Search failed.'); return }
      setLeads(data.leads ?? [])
      setSearched(true)
    } catch {
      setError('Request failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (lead: Lead) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { error } = await supabase.from('leads').insert({
      user_id:         session.user.id,
      place_id:        lead.place_id,
      business_name:   lead.business_name,
      category:        lead.category,
      address:         lead.address,
      city:            lead.city,
      phone:           lead.phone,
      rating:          lead.rating,
      review_count:    lead.review_count,
      google_maps_url: lead.google_maps_url,
      has_website:     lead.has_website,
      lead_status:     'new',
      reviews:         lead.reviews,     // stored as JSONB in Supabase
    })
    if (!error) setSavedIds(prev => new Set(prev).add(lead.place_id))
  }

  const handleSendToBuilder = (lead: Lead) => {
    const params = new URLSearchParams({
      business_name: lead.business_name,
      city:          lead.city,
      category:      lead.category,
    })
    // Pass reviews as JSON so the builder can inject them into the generate prompt
    if (lead.reviews.length > 0) {
      params.set('reviews', JSON.stringify(lead.reviews))
    }
    router.push(`/templates?${params.toString()}`)
  }

  const handleStatusChange = async (lead: Lead, status: string) => {
    setLeads(prev => prev.map(l => l.place_id === lead.place_id ? { ...l, lead_status: status } : l))
    if (!lead.id) return
    await supabase.from('leads').update({ lead_status: status }).eq('id', lead.id)
  }

  const exportCSV = () => {
    const rows = [
      ['Business', 'Category', 'Address', 'City', 'Phone', 'Rating', 'Reviews', 'Has Website', 'Top Review'],
      ...leads.map(l => [
        l.business_name, l.category, l.address, l.city, l.phone,
        l.rating ?? '', l.review_count ?? '',
        l.has_website ? 'Yes' : 'No',
        l.reviews[0]?.text ?? '',
      ]),
    ]
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `leads-${city}-${businessType}.csv`.toLowerCase().replace(/\s+/g, '-') })
    a.click()
    URL.revokeObjectURL(url)
  }

  const noWebsite  = leads.filter(l => !l.has_website)
  const hasWebsite = leads.filter(l =>  l.has_website)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ opacity: 0, position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.9)' }}>
        <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em', cursor: 'pointer' }} onClick={() => router.push('/')}>
          NOV<span style={{ color: 'var(--accent)' }}>UX</span>
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ label: '← Dashboard', path: '/dashboard' }, { label: '+ New Site', path: '/templates' }].map(btn => (
            <button
              key={btn.label}
              onClick={() => router.push(btn.path)}
              style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', transition: 'color 200ms, border-color 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '4rem 2.5rem 10rem' }}>

        {/* ── Hero ── */}
        <div ref={heroRef} style={{ opacity: 0, marginBottom: '3.5rem' }}>
          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>LEAD FINDER</Label>
          <Rule style={{ marginBottom: '2rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'end' }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
              Find businesses<br />
              <span style={{ color: 'var(--accent)' }}>with no website.</span>
            </h1>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              Search any city. We pull real Google data, flag every business with no site, and fetch their reviews — ready to drop straight into the generated website as real testimonials.
            </p>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <input
            value={businessType}
            onChange={e => setBusinessType(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Business type — e.g. Barbershop, Restaurant…"
            style={{ flex: 2, minWidth: '220px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: 'var(--text)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--f-body)', transition: 'border-color 200ms' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="City — e.g. Lagos, London, Dubai…"
            style={{ flex: 1, minWidth: '180px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem 1.25rem', color: 'var(--text)', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--f-body)', transition: 'border-color 200ms' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !businessType || !city}
            style={{ fontFamily: 'var(--f-body)', fontWeight: 700, fontSize: '0.9rem', backgroundColor: loading || !businessType || !city ? 'rgba(232,255,71,0.25)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: '10px', padding: '0.875rem 2rem', cursor: loading ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms, opacity 200ms' }}
          >
            {loading ? 'Searching…' : 'Search ✦'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.18)', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.825rem', color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        {/* ── Results ── */}
        {searched && (
          <div ref={resultRef} style={{ opacity: 0 }}>

            {/* Summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>{noWebsite.length}</span>
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>without a website</p>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }} />
                <div>
                  <span style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color: 'var(--muted)', lineHeight: 1 }}>{hasWebsite.length}</span>
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>already have one</p>
                </div>
                <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }} />
                <div>
                  <span style={{ fontFamily: 'var(--f-label)', fontSize: '2rem', color: 'var(--muted)', lineHeight: 1 }}>
                    {leads.reduce((acc, l) => acc + l.reviews.length, 0)}
                  </span>
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>real reviews fetched</p>
                </div>
              </div>
              {leads.length > 0 && (
                <button
                  onClick={exportCSV}
                  style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.875rem', cursor: 'pointer', transition: 'all 200ms' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  ↓ Export CSV
                </button>
              )}
            </div>

            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--border)', borderRadius: '14px' }}>
                <p style={{ fontFamily: 'var(--f-label)', fontSize: '3rem', color: 'var(--border2)', marginBottom: '1rem' }}>∅</p>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)' }}>No results. Try a different type or city.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 90px 200px', gap: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  {['Business', 'Rating', 'Reviews', 'Status', 'Actions'].map(h => (
                    <Label key={h}>{h.toUpperCase()}</Label>
                  ))}
                </div>

                {/* No website leads first */}
                {noWebsite.map(lead => (
                  <LeadCard
                    key={lead.place_id}
                    lead={{ ...lead, saved: savedIds.has(lead.place_id) }}
                    onSave={() => handleSave(lead)}
                    onSendToBuilder={() => handleSendToBuilder(lead)}
                    onStatusChange={status => handleStatusChange(lead, status)}
                  />
                ))}

                {/* Has website — dimmed section */}
                {hasWebsite.length > 0 && (
                  <>
                    <div style={{ padding: '0.625rem 1.5rem', backgroundColor: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                      <Label>ALREADY HAVE A WEBSITE</Label>
                    </div>
                    {hasWebsite.map(lead => (
                      <div key={lead.place_id} style={{ opacity: 0.38 }}>
                        <LeadCard
                          lead={{ ...lead, saved: savedIds.has(lead.place_id) }}
                          onSave={() => handleSave(lead)}
                          onSendToBuilder={() => handleSendToBuilder(lead)}
                          onStatusChange={status => handleStatusChange(lead, status)}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px dashed var(--border)', borderRadius: '14px' }}>
            <p style={{ fontFamily: 'var(--f-label)', fontSize: '4rem', color: 'var(--border2)', marginBottom: '1rem' }}>⌕</p>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Ready to find leads</p>
            <p style={{ fontFamily: 'var(--f-body)', color: 'var(--muted)', fontSize: '0.875rem' }}>
              Enter a business type and city above. We'll pull real Google data including reviews.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}