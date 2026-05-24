'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: "'Syne', sans-serif" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: '1.5rem', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '99px', padding: '0.4rem 1rem', backgroundColor: 'rgba(200,255,0,0.06)' }}>404</p>
      <h1 style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: '1.5rem' }}>
        Lost in<br /><span style={{ color: '#C8FF00' }}>the build.</span>
      </h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, maxWidth: '400px', marginBottom: '2.5rem' }}>
        This page doesn't exist. But your next website is just one click away.
      </p>
      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => router.push('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: '12px', padding: '0.875rem 2rem', cursor: 'pointer', backgroundColor: '#C8FF00', color: '#000000' }}>
          Go Home ✦
        </button>
        <button onClick={() => router.push('/templates')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', borderRadius: '12px', padding: '0.875rem 2rem', cursor: 'pointer', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Build a Site →
        </button>
      </div>
    </div>
  )
}