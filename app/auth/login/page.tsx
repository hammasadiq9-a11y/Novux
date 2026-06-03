'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const router  = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)

  const [mode,         setMode]         = useState<Mode>('login')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [name,         setName]         = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [focusedField, setFocusedField] = useState('')
  const [cardHovered,  setCardHovered]  = useState(false)

  /* Entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      gsap.fromTo(cardRef.current, { opacity: 0, y: 32, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 })
    })
    return () => ctx.revert()
  }, [])

  /* Auth state */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.push('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [router])

  /* Mode switch with animation */
  const switchMode = (m: Mode) => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      opacity: 0, y: 8, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setMode(m); setError(''); setSuccess('')
        gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      }
    })
  }

  /* Magnetic button */
  const onBtnMove = (e: React.MouseEvent) => {
    if (!btnRef.current || loading) return
    const r = btnRef.current.getBoundingClientRect()
    gsap.to(btnRef.current, {
      x: (e.clientX - r.left - r.width / 2) * 0.25,
      y: (e.clientY - r.top - r.height / 2) * 0.25,
      duration: 0.3, ease: 'power2.out',
    })
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

  const handleSubmit = async () => {
    setError(''); setSuccess('')

    if (mode === 'forgot') {
      if (!email) { setError('Please enter your email.'); return }
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      setLoading(false)
      if (error) setError(error.message)
      else setSuccess('Check your email for a password reset link.')
      return
    }

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (error) { setError(error.message); setLoading(false) }
      else { router.push('/onboarding') }
    }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', backgroundColor: '#1a1a1a',
    border: `1px solid ${focused ? '#C8FF00' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '10px', padding: '0.875rem 1.125rem',
    color: '#ffffff', fontSize: '0.9375rem', outline: 'none',
    fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
    boxSizing: 'border-box' as const,
  })

  const headings: Record<Mode, string> = {
    login:  'Welcome back.',
    signup: 'Create your account.',
    forgot: 'Reset your password.',
  }

  const subTexts: Record<Mode, React.ReactNode> = {
    login: (
      <>
        Don&apos;t have an account?{' '}
        <button onClick={() => switchMode('signup')}
          style={{ background: 'none', border: 'none', color: '#C8FF00', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
          Sign up
        </button>
      </>
    ),
    signup: (
      <>
        Already have an account?{' '}
        <button onClick={() => switchMode('login')}
          style={{ background: 'none', border: 'none', color: '#C8FF00', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
          Sign in
        </button>
      </>
    ),
    forgot: (
      <>
        Remembered it?{' '}
        <button onClick={() => switchMode('login')}
          style={{ background: 'none', border: 'none', color: '#C8FF00', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, padding: 0 }}>
          Back to sign in
        </button>
      </>
    ),
  }

  const btnLabels: Record<Mode, string> = {
    login:  'Sign In →',
    signup: 'Create Account ✦',
    forgot: 'Send Reset Link →',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

      {/* Glow */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', transition: 'opacity 400ms', opacity: cardHovered ? 1 : 0.6 }} />

      {/* Logo */}
      <div ref={logoRef} style={{ opacity: 0, textAlign: 'center', marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.375rem' }}>
          Build Different
        </p>
      </div>

      {/* Card */}
      <div ref={cardRef}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
        style={{
          opacity: 0, width: '100%', maxWidth: '420px',
          backgroundColor: '#111111',
          border: `1px solid ${cardHovered ? 'rgba(200,255,0,0.2)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '24px', padding: '2.5rem',
          boxShadow: cardHovered ? '0 0 60px rgba(200,255,0,0.06), 0 32px 80px rgba(0,0,0,0.5)' : '0 32px 80px rgba(0,0,0,0.5)',
          transition: 'border-color 350ms, box-shadow 350ms',
        }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '0.375rem' }}>
            {headings[mode]}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>
            {subTexts[mode]}
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>

          {mode === 'signup' && (
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={inputStyle(focusedField === 'name')} />
            </div>
          )}

          <div>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={inputStyle(focusedField === 'email')} />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>Password</label>
                {mode === 'login' && (
                  <button onClick={() => switchMode('forgot')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', padding: 0, transition: 'color 200ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C8FF00')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={inputStyle(focusedField === 'password')} />
            </div>
          )}
        </div>

        {/* Error / Success */}
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

        {/* Submit */}
        <button ref={btnRef} onClick={handleSubmit} disabled={loading}
          onMouseMove={onBtnMove} onMouseEnter={onBtnEnter} onMouseLeave={onBtnLeave}
          style={{ width: '100%', padding: '0.9375rem', backgroundColor: loading ? 'rgba(200,255,0,0.5)' : '#C8FF00', color: '#000000', border: 'none', borderRadius: '10px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'box-shadow 250ms, background-color 200ms', letterSpacing: '-0.01em', willChange: 'transform' }}>
          {loading ? 'Please wait…' : btnLabels[mode]}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Back to home */}
        <button onClick={() => router.push('/')}
          style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'color 200ms, border-color 200ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
          ← Back to Novux
        </button>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)', marginTop: '2rem', textAlign: 'center' }}>
        By signing up you agree to our terms of service.
      </p>
    </div>
  )
}