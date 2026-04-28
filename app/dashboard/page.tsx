'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          NOV<span className="text-[#C8FF00]">UX</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">{user?.email}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/auth/login')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-8 py-12 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black mb-2">
            Welcome back 👋
          </h2>
          <p className="text-gray-500">
            Create and manage your websites from here.
          </p>
        </div>

        {/* Create New Project Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#C8FF00]/50 hover:bg-[#C8FF00]/5 transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#C8FF00]/10 flex items-center justify-center group-hover:bg-[#C8FF00]/20 transition-all">
              <span className="text-[#C8FF00] text-2xl font-bold">+</span>
            </div>
            <span className="text-white font-semibold">New Project</span>
            <span className="text-gray-500 text-sm text-center">
              Create a new website with AI
            </span>
          </button>
        </div>

      </main>
    </div>
  )
}