'use client'

import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">
            NOV<span className="text-[#C8FF00]">UX</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase">
            Build Different
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#C8FF00',
                    brandAccent: '#a8d400',
                    brandButtonText: '#000000',
                    defaultButtonBackground: '#1a1a1a',
                    defaultButtonBackgroundHover: '#222222',
                    inputBackground: '#1a1a1a',
                    inputBorder: '#333333',
                    inputBorderHover: '#C8FF00',
                    inputBorderFocus: '#C8FF00',
                    inputText: '#ffffff',
                    inputPlaceholder: '#555555',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>

      </div>
    </div>
  )
}