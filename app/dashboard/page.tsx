'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import MagneticButton from '../components/MagneticButton'
import FadeUp from '../components/FadeUp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
      }
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] px-8 py-4 flex items-center justify-between"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,10,10,0.85)' }}>
        <h1 className="text-2xl font-black tracking-tight">
          NOV<span className="text-[#C8FF00]">UX</span>
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-sm text-white/40">{user?.email}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/auth/login')
            }}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

     <main className="max-w-6xl mx-auto px-8 py-24">

        {/* Header */}
        <FadeUp>
          <div className="mb-16">
            <div className="w-10 h-[3px] bg-[#C8FF00] rounded-full mb-6" />
            <h2 className="text-6xl font-black tracking-tight mb-3">
              Welcome back 👋
            </h2>
            <p className="text-white/40 text-lg">
              Create and manage your websites from here.
            </p>
          </div>
        </FadeUp>

        {/* Bento Grid */}
        <FadeUp delay={200}>
          <div className="grid grid-cols-3 gap-[1px] bg-white/[0.08] rounded-2xl overflow-hidden">

            {/* New Project */}
            <div
              className="bg-[#111111] p-8 cursor-pointer hover:bg-[#161616] transition-colors col-span-1"
              onClick={() => router.push('/templates')}
            >
              <div className="w-12 h-12 rounded-xl bg-[#C8FF00]/10 flex items-center justify-center mb-6">
                <span className="text-[#C8FF00] text-2xl font-bold">+</span>
              </div>
              <h3 className="text-xl font-bold mb-2">New Project</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Generate an Awwwards-quality website with AI in seconds
              </p>
              <div className="mt-6 text-[#C8FF00] text-sm font-medium">
                Get started →
              </div>
            </div>

            {/* Sites Generated */}
            <div className="bg-[#111111] p-8 col-span-1">
              <p className="text-white/40 text-sm mb-3 uppercase tracking-widest">
                Sites Generated
              </p>
              <h3 className="text-7xl font-black text-[#C8FF00]">0</h3>
              <p className="text-white/20 text-sm mt-3">
                Start building today
              </p>
            </div>

            {/* Current Plan */}
            <div className="bg-[#111111] p-8 col-span-1 flex flex-col">
              <p className="text-white/40 text-sm mb-3 uppercase tracking-widest">
                Current Plan
              </p>
              <h3 className="text-3xl font-black mb-2">Free</h3>
              <p className="text-white/40 text-sm mb-6">
                Upgrade for unlimited sites and premium features
              </p>
             <div className="mt-auto">
  <button
    onClick={() => router.push('/pricing')}
    className="px-6 py-3 rounded-full bg-[#C8FF00] text-black font-bold text-sm hover:bg-[#a8d400] transition-colors"
  >
    Upgrade to Pro ✦
  </button>
</div>
            </div>

            {/* Recent Projects — full width */}
            <div className="bg-[#111111] p-8 col-span-3">
              <p className="text-white/40 text-sm mb-6 uppercase tracking-widest">
                Recent Projects
              </p>
              <div className="flex items-center justify-center py-12 border border-dashed border-white/[0.08] rounded-xl">
                <div className="text-center">
                  <p className="text-white/20 text-sm mb-4">No projects yet</p>
                  <button
                    onClick={() => router.push('/templates')}
                    className="text-[#C8FF00] text-sm font-medium hover:opacity-70 transition-opacity"
                  >
                    Create your first site →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </FadeUp>

      </main>
    </div>
  )
}