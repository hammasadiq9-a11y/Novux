'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const template = params.template as string

  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  const handleGenerate = async () => {
    if (!businessName) return
    setLoading(true)
    setStep(3)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          template,
        })
      })

      const data = await response.json()
      setGeneratedCode(data.html)
      setStep(4)
    } catch (error) {
      console.error(error)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          NOV<span className="text-[#C8FF00]">UX</span>
        </h1>
        <button
          onClick={() => router.push('/templates')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Change Template
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">

        {/* Step 1 — Business Name */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <p className="text-[#C8FF00] text-sm font-medium tracking-widest uppercase mb-4">
                Step 1 of 2
              </p>
              <h2 className="text-5xl font-black mb-4">
                What's your business called?
              </h2>
              <p className="text-gray-500 text-lg">
                This will be used throughout your website.
              </p>
            </div>

            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Nova Studio, John's Bakery..."
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#C8FF00] transition-colors"
            />

            <button
              onClick={() => businessName && setStep(2)}
              className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl text-lg hover:bg-[#a8d400] transition-colors disabled:opacity-50"
              disabled={!businessName}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Business Description */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <p className="text-[#C8FF00] text-sm font-medium tracking-widest uppercase mb-4">
                Step 2 of 2
              </p>
              <h2 className="text-5xl font-black mb-4">
                Describe your business
              </h2>
              <p className="text-gray-500 text-lg">
                The more detail you give the better your site will be.
              </p>
            </div>

            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="e.g. We are a creative agency specializing in brand identity and digital experiences for luxury brands..."
              rows={5}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#C8FF00] transition-colors resize-none"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full border border-white/10 text-white font-bold py-4 rounded-xl text-lg hover:bg-white/5 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl text-lg hover:bg-[#a8d400] transition-colors"
              >
                Generate My Site ✨
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Loading */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="w-20 h-20 border-4 border-[#C8FF00]/20 border-t-[#C8FF00] rounded-full animate-spin" />
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2">Building your site...</h2>
              <p className="text-gray-500">AI is generating your Awwwards-quality website</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 text-center">
              <p>✦ Designing layout</p>
              <p>✦ Writing copy</p>
              <p>✦ Optimizing for performance</p>
            </div>
          </div>
        )}

        {/* Step 4 — Result */}
        {step === 4 && generatedCode && (
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-black mb-4">
                Your site is <span className="text-[#C8FF00]">ready!</span>
              </h2>
              <p className="text-gray-500 text-lg">
                Preview your site below or download the code.
              </p>
            </div>

            {/* Preview */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-[#111111] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-gray-500 text-sm ml-2">{businessName}</span>
              </div>
              <iframe
                srcDoc={generatedCode}
                className="w-full h-[500px] bg-white"
                title="Generated Website Preview"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const blob = new Blob([generatedCode], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${businessName}-website.html`
                  a.click()
                }}
                className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl text-lg hover:bg-[#a8d400] transition-colors"
              >
                Download HTML ↓
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setGeneratedCode('')
                  setBusinessName('')
                  setBusinessDescription('')
                }}
                className="w-full border border-white/10 text-white font-bold py-4 rounded-xl text-lg hover:bg-white/5 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}