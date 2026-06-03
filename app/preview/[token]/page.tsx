import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PreviewPage({ params }: { params: { token: string } }) {
  const { data: project } = await supabase
    .from('projects')
    .select('name, html, preview_expires_at')
    .eq('preview_token', params.token)
    .single()

  if (!project) notFound()

  if (project.preview_expires_at && new Date(project.preview_expires_at) < new Date()) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Preview link expired</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>This preview link is no longer active. Contact the sender for a new one.</p>
      </div>
    )
  }

  return (
    <>
      {/* Powered by Novux bar */}
      <div style={{ position: 'fixed', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, backgroundColor: 'rgba(10,10,10,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>·</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          Preview of <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{project.name}</strong>
        </span>
        <a href="/" target="_blank" rel="noreferrer"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: '#000', backgroundColor: '#C8FF00', borderRadius: '99px', padding: '0.2rem 0.75rem', textDecoration: 'none', marginLeft: '0.25rem' }}>
          Build yours →
        </a>
      </div>

      {/* Full page site render */}
      <div dangerouslySetInnerHTML={{ __html: project.html }} />
    </>
  )
}