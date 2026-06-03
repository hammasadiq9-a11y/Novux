'use client'

import { useEffect, useRef, useState } from 'react'
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
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes pulse   { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes spin    { to { transform: rotate(360deg); } }
`

// ─── Admin guard — only Elsiddique can access this ─────────────────────────
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'your@email.com'

const Rule  = ({ style }: { style?: React.CSSProperties }) => <div style={{ height: '1px', backgroundColor: 'var(--border)', width: '100%', ...style }} />
const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span style={{ fontFamily: 'var(--f-label)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--muted)', ...style }}>{children}</span>
)

function Btn({ children, onClick, variant = 'accent', size = 'sm', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'accent' | 'ghost' | 'danger'; size?: 'sm' | 'md'; disabled?: boolean
}) {
  const styles = {
    accent: { backgroundColor: 'var(--accent)', color: '#000', border: 'none' },
    ghost:  { backgroundColor: 'transparent',   color: 'var(--muted)', border: '1px solid var(--border)' },
    danger: { backgroundColor: 'rgba(255,77,77,0.08)', color: 'var(--danger)', border: '1px solid rgba(255,77,77,0.2)' },
  }
  const pads = { sm: '0.35rem 0.875rem', md: '0.6rem 1.375rem' }
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...styles[variant], fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.78rem', padding: pads[size], borderRadius: '7px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'opacity 200ms', whiteSpace: 'nowrap' }}
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

interface User {
  id:         string
  email:      string
  full_name:  string
  plan:        string
  created_at: string
  site_count: number
}

interface Project {
  id:         string
  name:       string
  template:   string
  created_at: string
  user_email: string
  user_id:    string
}

type Tab = 'overview' | 'users' | 'sites' | 'leads'

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { gsap.fromTo(ref.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }) }, [])
  return (
    <div ref={ref} style={{ opacity: 0, backgroundColor: accent ? 'var(--accent-dim)' : 'var(--surface)', border: `1px solid ${accent ? 'var(--accent-mid)' : 'var(--border)'}`, borderRadius: '12px', padding: '1.5rem' }}>
      <Label style={{ display: 'block', marginBottom: '0.75rem', color: accent ? 'var(--accent)' : 'var(--muted)' }}>{label.toUpperCase()}</Label>
      <p style={{ fontFamily: 'var(--f-label)', fontSize: '2.75rem', color: accent ? 'var(--accent)' : 'var(--text)', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</p>
      {sub && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

// ─── User row ─────────────────────────────────────────────────────────────────
function UserRow({ user, onBanToggle }: { user: User; onBanToggle: (id: string) => void }) {
  const planColor = { free: 'var(--muted)', pro: 'var(--accent)', agency: '#60a5fa', banned: 'var(--danger)' }[user.plan] ?? 'var(--muted)'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 80px 120px', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div>
        <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{user.full_name || '—'}</p>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>{user.email}</p>
      </div>
      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>
        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </p>
      <p style={{ fontFamily: 'var(--f-label)', fontSize: '1.25rem', color: 'var(--text)', textAlign: 'center' }}>{user.site_count}</p>
      <Label style={{ color: planColor, backgroundColor: `${planColor}18`, border: `1px solid ${planColor}28`, borderRadius: '4px', padding: '0.15rem 0.5rem', textAlign: 'center' }}>
        {user.plan.toUpperCase()}
      </Label>
      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
        <Btn variant={user.plan === 'banned' ? 'accent' : 'danger'} size="sm" onClick={() => onBanToggle(user.id)}>
          {user.plan === 'banned' ? 'Unban' : 'Ban'}
        </Btn>
      </div>
    </div>
  )
}

// ─── Site row ─────────────────────────────────────────────────────────────────
function SiteRow({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div>
        <p style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{project.name}</p>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>{project.user_email || project.user_id.slice(0, 8) + '…'}</p>
      </div>
      <Label style={{ color: 'var(--text)' }}>{project.template.toUpperCase()}</Label>
      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>
        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="danger" size="sm" onClick={() => onDelete(project.id)}>Delete</Btn>
      </div>
    </div>
  )
}

// ─── Table header ─────────────────────────────────────────────────────────────
function TableHead({ cols }: { cols: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols.map(() => '1fr').join(' '), gap: '1rem', padding: '0.625rem 1.5rem', backgroundColor: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
      {cols.map(c => <Label key={c}>{c.toUpperCase()}</Label>)}
    </div>
  )
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ width: '36px', height: '36px', position: 'relative', margin: '4rem auto' }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--border)' }} />
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', borderTop: '1.5px solid var(--accent)', borderRight: '1.5px solid transparent', borderBottom: '1.5px solid transparent', borderLeft: '1.5px solid transparent', animation: 'spin 1s linear infinite' }} />
  </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router  = useRouter()
  const navRef  = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const [tab,        setTab]        = useState<Tab>('overview')
  const [authed,     setAuthed]     = useState<boolean | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [users,      setUsers]      = useState<User[]>([])
  const [projects,   setProjects]   = useState<Project[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [siteSearch, setSiteSearch] = useState('')

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user || session.user.email !== ADMIN_EMAIL) {
        setAuthed(false)
        router.replace('/dashboard')
      } else {
        setAuthed(true)
      }
    })
  }, [router])

  // Load data
  useEffect(() => {
    if (!authed) return
    const load = async () => {
      setLoading(true)

      // Users — join profiles + project count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, plan, created_at')
        .order('created_at', { ascending: false })

      const { data: projectCounts } = await supabase
        .from('projects')
        .select('user_id')

      const countMap: Record<string, number> = {}
      projectCounts?.forEach(p => { countMap[p.user_id] = (countMap[p.user_id] ?? 0) + 1 })

      // Get emails from auth — admin only
      // In production, store email in profiles table for easier access
      const enrichedUsers: User[] = (profiles ?? []).map(p => ({
        id:         p.id,
        email:      p.id,   // replace with email if stored in profiles
        full_name:  p.full_name ?? '',
        plan:       p.plan ?? 'free',
        created_at: p.created_at,
        site_count: countMap[p.id] ?? 0,
      }))
      setUsers(enrichedUsers)

      // Projects
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name, template, created_at, user_id')
        .order('created_at', { ascending: false })
      setProjects((proj ?? []).map(p => ({ ...p, user_email: '' })))

      setLoading(false)
    }
    load()
  }, [authed])

  useEffect(() => {
    gsap.fromTo(navRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (!bodyRef.current) return
    gsap.fromTo(bodyRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' })
  }, [tab])

  const banToggle = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return
    const newPlan = user.plan === 'banned' ? 'free' : 'banned'
    await supabase.from('profiles').update({ plan: newPlan }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
  }

  const deleteSite = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  if (authed === null) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}><style>{FONTS}</style><Spinner /></div>
  if (authed === false) return null

  const totalSites    = projects.length
  const totalUsers    = users.length
  const proUsers      = users.filter(u => u.plan === 'pro').length
  const agencyUsers   = users.filter(u => u.plan === 'agency').length
  const bannedUsers   = users.filter(u => u.plan === 'banned').length
  const sitesThisWeek = projects.filter(p => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length

  const filteredUsers = users.filter(u =>
    userSearch === '' || u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredSites = projects.filter(p =>
    siteSearch === '' || p.name.toLowerCase().includes(siteSearch.toLowerCase()) || p.template.toLowerCase().includes(siteSearch.toLowerCase())
  )

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users',    label: `Users (${totalUsers})` },
    { id: 'sites',    label: `Sites (${totalSites})` },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{FONTS}</style>

      {/* ── Nav ── */}
      <nav ref={navRef} style={{ opacity: 0, position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(5,5,5,0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--f-label)', fontSize: '1.3rem', letterSpacing: '0.06em', cursor: 'pointer' }} onClick={() => router.push('/')}>
            NOV<span style={{ color: 'var(--accent)' }}>UX</span>
          </span>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }} />
          <Label style={{ color: 'var(--accent)' }}>ADMIN</Label>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>← Dashboard</Btn>
      </nav>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '4rem 2.5rem 10rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <Label style={{ display: 'block', marginBottom: '1.25rem' }}>NOVUX ADMIN</Label>
          <Rule style={{ marginBottom: '2rem' }} />
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
            Control<br /><span style={{ color: 'var(--accent)' }}>Centre.</span>
          </h1>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: '0.825rem', padding: '0.625rem 1.25rem', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, color: tab === t.id ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', transition: 'color 200ms, border-color 200ms', marginBottom: '-1px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div ref={bodyRef} style={{ opacity: 0 }}>

            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', backgroundColor: 'var(--border)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                  {[
                    { label: 'Total Users',    value: totalUsers,    sub: 'Registered accounts', accent: false },
                    { label: 'Total Sites',    value: totalSites,    sub: 'All generations',      accent: false },
                    { label: 'Pro Users',      value: proUsers,      sub: '$49/mo each',          accent: true  },
                    { label: 'Agency Users',   value: agencyUsers,   sub: '$99/mo each',          accent: false },
                    { label: 'Sites This Week',value: sitesThisWeek, sub: 'Last 7 days',          accent: false },
                    { label: 'Banned',         value: bannedUsers,   sub: 'Suspended accounts',   accent: false },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: 'var(--bg)' }}>
                      <StatTile {...s} />
                    </div>
                  ))}
                </div>

                {/* Revenue estimate */}
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '2rem' }}>
                  <Label style={{ display: 'block', marginBottom: '1.25rem' }}>REVENUE ESTIMATE</Label>
                  <Rule style={{ marginBottom: '2rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    {[
                      { label: 'MRR (estimate)', value: `$${(proUsers * 49 + agencyUsers * 99).toLocaleString()}`, sub: 'Based on current plans' },
                      { label: 'Pro Revenue',    value: `$${(proUsers * 49).toLocaleString()}`,                   sub: `${proUsers} pro users × $49` },
                      { label: 'Agency Revenue', value: `$${(agencyUsers * 99).toLocaleString()}`,                sub: `${agencyUsers} agency users × $99` },
                    ].map(r => (
                      <div key={r.label}>
                        <Label style={{ display: 'block', marginBottom: '0.5rem' }}>{r.label.toUpperCase()}</Label>
                        <p style={{ fontFamily: 'var(--f-label)', fontSize: '2.25rem', color: 'var(--accent)', lineHeight: 1, marginBottom: '0.25rem' }}>{r.value}</p>
                        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>{r.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <Label>RECENT GENERATIONS</Label>
                  </div>
                  {projects.slice(0, 8).map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderBottom: i < 7 ? '1px solid var(--border)' : 'none', transition: 'background 150ms' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Label style={{ color: 'var(--text)', backgroundColor: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>{p.template.toUpperCase()}</Label>
                        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--text)' }}>{p.name}</p>
                      </div>
                      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Users ── */}
            {tab === 'users' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users…"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem 1rem', color: 'var(--text)', fontSize: '0.825rem', fontFamily: 'var(--f-body)', outline: 'none', width: '260px', transition: 'border-color 200ms' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <Label>{filteredUsers.length} USERS</Label>
                </div>
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 80px 120px', gap: '1rem', padding: '0.625rem 1.5rem', backgroundColor: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                    {['User', 'Joined', 'Sites', 'Plan', 'Actions'].map(h => <Label key={h}>{h.toUpperCase()}</Label>)}
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)' }}>No users found.</p>
                    </div>
                  ) : filteredUsers.map(u => <UserRow key={u.id} user={u} onBanToggle={banToggle} />)}
                </div>
              </div>
            )}

            {/* ── Sites ── */}
            {tab === 'sites' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <input
                    value={siteSearch}
                    onChange={e => setSiteSearch(e.target.value)}
                    placeholder="Search sites…"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem 1rem', color: 'var(--text)', fontSize: '0.825rem', fontFamily: 'var(--f-body)', outline: 'none', width: '260px', transition: 'border-color 200ms' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <Label>{filteredSites.length} SITES</Label>
                </div>
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', gap: '1rem', padding: '0.625rem 1.5rem', backgroundColor: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                    {['Site', 'Template', 'Created', 'Actions'].map(h => <Label key={h}>{h.toUpperCase()}</Label>)}
                  </div>
                  {filteredSites.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--muted)' }}>No sites found.</p>
                    </div>
                  ) : filteredSites.map(p => <SiteRow key={p.id} project={p} onDelete={deleteSite} />)}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}