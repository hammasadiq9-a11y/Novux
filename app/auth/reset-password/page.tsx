'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router  = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)

  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [focusedField, setFocusedField] = useState('')
  const [cardHovered,  setCardHovered]  = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      gsap.fromTo(cardRef.current, { opacity: 0, y: 32, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    // Supabase sets the session automatically when the reset link is opened
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const onBtnMove = (e: React.MouseEvent) => {
    if (!btnRef.current || loading) return
    const r = btnRef.current.getBoundingClientRect()
    gsap.to(btnRef.current, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3, ease: 'power2.out' })
  }
  const onBtnLeave = () => {
    if (!btnRef.current) return
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
    btnRef.current.style.boxShadow = 'none'
  }
  const onBtnEnter = () => {
    if (!btnRef.current || loading) return
    btnRef.current.style.boxShadow = '0 0 32px rgba(200,255,0,0.4)'
  }

  const handleReset = async () => {
    setError(''); setSuccess('')
    if (!password || !confirm) { setError('Please fill in both fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('Password updated! Redirecting…')
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', backgroundColor: '#1a1a1a',
    border: `1px solid ${focused ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '10px', padding: '0.875rem 1.125rem',
    color: '#ffffff', fontSize: '0.9375rem', outline: 'none',
    fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
    boxSizing: 'border-box' as const,
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', opacity: cardHovered ? 1 : 0.6, transition: 'opacity 400ms' }} />

      <div ref={logoRef} style={{ opacity: 0, textAlign: 'center', marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.375rem' }}>
          Build Different
        </p>
      </div>

      <div ref={cardRef}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
        style={{ opacity: 0, width: '100%', maxWidth: '420px', backgroundColor: '#111111', border: `1px solid ${cardHovered ? 'rgba(200,255,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '2.5rem', boxShadow: cardHovered ? '0 0 60px rgba(200,255,0,0.06), 0 32px 80px rgba(0,0,0,0.5)' : '0 32px 80px rgba(0,0,0,0.5)', transition: 'border-color 350ms, box-shadow 350ms' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '0.375rem' }}>
            Set new password.
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>
            Choose a strong password for your account.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              style={inputStyle(focusedField === 'password')} />
          </div>
          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField('')}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              style={inputStyle(focusedField === 'confirm')} />
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#C8FF00' }}>{success}</p>
          </div>
        )}

        <button ref={btnRef} onClick={handleReset} disabled={loading}
          onMouseMove={onBtnMove} onMouseEnter={onBtnEnter} onMouseLeave={onBtnLeave}
          style={{ width: '100%', padding: '0.9375rem', backgroundColor: loading ? 'rgba(200,255,0,0.5)' : '#C8FF00', color: '#000000', border: 'none', borderRadius: '10px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'box-shadow 250ms, background-color 200ms', letterSpacing: '-0.01em', willChange: 'transform' }}>
          {loading ? 'Updating…' : 'Update Password →'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        <button onClick={() => router.push('/auth/login')}
          style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'color 200ms, border-color 200ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
          ← Back to sign in
        </button>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)', marginTop: '2rem', textAlign: 'center' }}>
        By signing up you agree to our terms of service.
      </p>
    </div>
  )
}