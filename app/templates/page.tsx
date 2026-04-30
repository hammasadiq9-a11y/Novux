'use client'

import { useRouter } from 'next/navigation'
import FadeUp from '../components/FadeUp'

const templates = [
  { id: 'agency', name: 'Agency', description: 'Perfect for creative agencies and studios', category: 'Business', color: '#C8FF00' },
  { id: 'restaurant', name: 'Restaurant', description: 'Beautiful menus and reservation layouts', category: 'Food', color: '#FF6B35' },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work with style', category: 'Creative', color: '#A855F7' },
  { id: 'saas', name: 'SaaS', description: 'Convert visitors into customers', category: 'Tech', color: '#3B82F6' },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Sell products with a premium storefront', category: 'Store', color: '#EC4899' },
  { id: 'blog', name: 'Blog', description: 'Share your ideas with the world', category: 'Content', color: '#F59E0B' },
  { id: 'realestate', name: 'Real Estate', description: 'List and sell properties beautifully', category: 'Business', color: '#10B981' },
  { id: 'startup', name: 'Startup', description: 'Launch your idea with impact', category: 'Tech', color: '#C8FF00' },
  { id: 'nonprofit', name: 'Non-Profit', description: 'Inspire action and raise awareness', category: 'Organization', color: '#EF4444' },
]

export default function TemplatesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] px-8 py-4 flex items-center justify-between"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,10,10,0.85)' }}>
        <h1 className="text-2xl font-black tracking-tight">
          NOV<span className="text-[#C8FF00]">UX</span>
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          ← Dashboard
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-24">

        {/* Header */}
        <FadeUp>
          <div className="mb-16 text-center">
            <div className="w-10 h-[3px] bg-[#C8FF00] rounded-full mx-auto mb-6" />
            <h2 className="text-6xl font-black tracking-tight mb-4">
              Choose a <span className="text-[#C8FF00]">Template</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Pick a starting point and AI will build your complete website in seconds
            </p>
          </div>
        </FadeUp>

        {/* Templates Bento Grid */}
        <FadeUp delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.08] rounded-2xl overflow-hidden">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => router.push(`/builder/${template.id}`)}
                className="bg-[#111111] p-8 text-left hover:bg-[#161616] transition-all group"
              >
                {/* Preview */}
                <div
                  className="w-full h-36 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `${template.color}10` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `${template.color}08` }}
                  />
                  <span className="text-6xl font-black" style={{ color: template.color }}>
                    {template.name.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{template.name}</h3>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: `${template.color}15`, color: template.color }}
                  >
                    {template.category}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-4">
                  {template.description}
                </p>
                <span
                  className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: template.color }}
                >
                  Use template →
                </span>
              </button>
            ))}
          </div>
        </FadeUp>

      </main>
    </div>
  )
}