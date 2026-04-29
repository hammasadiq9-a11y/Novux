import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessDescription, template } = await req.json()

    const templatePrompts: Record<string, string> = {
      agency: 'a modern creative agency with bold typography and dark aesthetic',
      restaurant: 'an upscale restaurant with elegant design and warm colors',
      portfolio: 'a minimal portfolio for a creative professional',
      saas: 'a high converting SaaS landing page with clear CTAs',
      ecommerce: 'a premium ecommerce store with clean product layouts',
      blog: 'a modern blog with great typography and reading experience',
      realestate: 'a luxury real estate agency with property listings',
      startup: 'a bold startup landing page that drives signups',
      nonprofit: 'an inspiring nonprofit site that drives donations',
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web designer and developer. You create stunning, modern, Awwwards-quality websites. You only respond with complete HTML code, nothing else.'
          },
          {
            role: 'user',
            content: `Create a complete, beautiful, single-page HTML website for ${businessName}.

Business description: ${businessDescription || 'A professional business'}
Template style: ${templatePrompts[template] || 'modern and professional'}

Requirements:
- Complete HTML file with inline CSS and JS
- Awwwards-quality design
- Dark theme with accent colors
- Mobile responsive
- Smooth animations
- Modern typography using Google Fonts
- Sections: Hero, About, Services/Features, Testimonials, Contact, Footer
- Professional and conversion-focused

Return ONLY the complete HTML code starting with <!DOCTYPE html>. Nothing else. No markdown, no backticks, just pure HTML.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'Failed to generate site' }, { status: 500 })
    }

    const data = await response.json()
    const html = data.choices[0].message.content

    // Clean up any markdown backticks just in case
    const cleanHtml = html.replace(/```html/g, '').replace(/```/g, '').trim()

    return NextResponse.json({ html: cleanHtml })

  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}