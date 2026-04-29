'use client'

import { useRouter } from 'next/navigation'

const templates = [
  {
    id: 'agency',
    name: 'Agency',
    description: 'Perfect for creative agencies and studios',
    category: 'Business',
    color: '#C8FF00',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Beautiful menus and reservation layouts',
    category: 'Food',
    color: '#FF6B35',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your work with style',
    category: 'Creative',
    color: '#A855F7',
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Convert visitors into customers',
    category: 'Tech',
    color: '#3B82F6',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Sell products with a premium storefront',
    category: 'Store',
    color: '#EC4899',
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Share your ideas with the world',
    category: 'Content',
    color: '#F59E0B',
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    description: 'List and sell properties beautifully',
    category: 'Business',
    color: '#10B981',
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'Launch your idea with impact',
    category: 'Tech',
    color: '#C8FF00',
  },
  {
    id: 'nonprofit',
    name: 'Non-Profit',
    description: 'Inspire action and raise awareness',
    category: 'Organization',
    color: '#EF4444',
  },
]

export default function TemplatesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          NOV<span className="text-[#C8FF00]">UX</span>
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </nav>

      {/* Header */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black mb-4">
            Choose a <span className="text-[#C8FF00]">Template</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Pick a starting point and AI will build your site in seconds
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => router.push(`/builder/${template.id}`)}
              className="bg-[#111111] border border-white/10 rounded-2xl p-8 text-left hover:border-white/30 hover:bg-[#161616] transition-all group"
            >
              {/* Template Preview */}
              <div
                className="w-full h-40 rounded-xl mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${template.color}15` }}
              >
                <span
                  className="text-5xl font-black"
                  style={{ color: template.color }}
                >
                  {template.name.charAt(0)}
                </span>
              </div>

              {/* Template Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {template.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {template.description}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${template.color}20`,
                    color: template.color,
                  }}
                >
                  {template.category}
                </span>
              </div>

              {/* Hover CTA */}
              <div className="mt-4 text-sm text-gray-600 group-hover:text-[#C8FF00] transition-colors">
                Use this template →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}