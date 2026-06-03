'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'

const steps = [
  {
    id: 'welcome',
    type: 'welcome',
  },
  {
    id: 'goal',
    type: 'choice',
    question: "What are you here to do?",
    sub: "This helps us set up your experience.",
    options: [
      { value: 'freelancer', label: 'Build sites for clients', emoji: '💼', desc: 'Use Novux to generate and sell websites' },
      { value: 'agency',     label: 'Run an agency',           emoji: '🏢', desc: 'Build at scale for multiple clients'    },
      { value: 'personal',   label: 'Build my own site',       emoji: '✦',  desc: 'A website for my own business'         },
    ],
  },
  {
    id: 'experience',
    type: 'choice',
    question: "How comfortable are you with web design?",
    sub: "No wrong answer — this shapes how we guide you.",
    options: [
      { value: 'beginner',      label: 'Complete beginner',  emoji: '🌱', desc: "I've never built a website before"   },
      { value: 'intermediate',  label: 'Some experience',    emoji: '⚡', desc: 'I know the basics but want it faster' },
      { value: 'professional',  label: 'Professional',       emoji: '🎯', desc: 'I build sites regularly for clients'  },
    ],
  },
  {
    id: 'ready',
    type: 'ready',
  },
]

export default function OnboardingPage() {
  const router  = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [userName,    setUserName]    = useState('')
  const [answers,     setAnswers]     = useState<Record<string, string>>({})
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()

      if (profile?.full_name) setUserName(profile.full_name.split(' ')[0])
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (loading) return
    if (!logoRef.current || !cardRef.current) return
    gsap.fromTo(logoRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    gsap.fromTo(cardRef.current, { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 })
  }, [loading])

  const animateNext = (fn: () => void) => {
    if (!cardRef.current) { fn(); return }
    gsap.to(cardRef.current, {
      opacity: 0, y: -16, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        fn()
        gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' })
      }
    })
  }

  const handleChoice = (stepId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }))
    animateNext(() => setCurrentStep(prev => prev + 1))
  }

  const handleFinish = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', session.user.id)
    }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', borderTop: '2px solid #C8FF00', borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const step = steps[currentStep]
  const progress = ((currentStep) / (steps.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />

      {/* Glow */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div ref={logoRef} style={{ opacity: 0, marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center' }}>
          NOV<span style={{ color: '#C8FF00' }}>UX</span>
        </h1>
      </div>

      {/* Progress bar */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div style={{ width: '100%', maxWidth: '480px', marginBottom: '2rem' }}>
          <div style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#C8FF00', width: `${progress}%`, borderRadius: '99px', transition: 'width 400ms ease' }} />
          </div>
        </div>
      )}

      {/* Card */}
      <div ref={cardRef} style={{ opacity: 0, width: '100%', maxWidth: '480px', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2.5rem' }}>

        {/* Welcome step */}
        {step.type === 'welcome' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✦</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.75rem,5vw,2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
              Welcome{userName ? `, ${userName}` : ''}.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              You just unlocked the fastest way to build websites for real businesses. Let's set you up in 60 seconds.
            </p>
            <button onClick={() => animateNext(() => setCurrentStep(1))}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#C8FF00', color: '#000', fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '1rem', border: 'none', borderRadius: '12px', cursor: 'pointer', letterSpacing: '-0.01em' }}>
              Let's go →
            </button>
          </div>
        )}

        {/* Choice step */}
        {step.type === 'choice' && (
          <div>
            <div style={{ width: '32px', height: '3px', backgroundColor: '#C8FF00', borderRadius: '99px', marginBottom: '1.5rem' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {step.question}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.75rem' }}>
              {step.sub}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {step.options?.map(opt => (
                <button key={opt.value} onClick={() => handleChoice(step.id, opt.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', backgroundColor: answers[step.id] === opt.value ? 'rgba(200,255,0,0.07)' : '#1a1a1a', border: `1px solid ${answers[step.id] === opt.value ? '#C8FF00' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = answers[step.id] === opt.value ? '#C8FF00' : 'rgba(255,255,255,0.07)')}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{opt.emoji}</span>
                  <div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.925rem', color: '#fff', marginBottom: '0.2rem' }}>{opt.label}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ready step */}
        {step.type === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(200,255,0,0.1)', border: '1px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
              ✦
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.75rem,5vw,2.25rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
              You're all set.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Your dashboard is ready. Build your first site in under 2 minutes.
            </p>
            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.875rem' }}>What's waiting for you</p>
              {[
                '✦ AI site generator — 2 unique variations per brief',
                '🔍 Lead Finder — find businesses with no website',
                '◈ SEO Auditor — analyse and improve your sites',
                '▲ One-click deploy to your own domain',
              ].map(item => (
                <p key={item} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.825rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>{item}</p>
              ))}
            </div>
            <button onClick={handleFinish} disabled={saving}
              style={{ width: '100%', padding: '1rem', backgroundColor: saving ? 'rgba(200,255,0,0.5)' : '#C8FF00', color: '#000', fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: '1rem', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em' }}>
              {saving ? 'Setting up…' : 'Open my dashboard →'}
            </button>
          </div>
        )}
      </div>

      {/* Step indicator */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem' }}>
          Step {currentStep} of {steps.length - 2}
        </p>
      )}
    </div>
  )
}