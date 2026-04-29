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

    const response = await fetch(
      `https://api.groq.com/openai/v1/chat/completions`,
      {
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
              content: `You are a world class web designer and developer who creates stunning, award-winning websites. You have won multiple Awwwards and your work is featured in design magazines. You create websites that are:
- Visually stunning with premium aesthetics
- Conversion focused with clear call to actions
- Fully responsive and mobile first
- Fast loading with optimized code
- Modern with smooth animations and interactions
You ONLY respond with complete, working HTML code. Never add explanations or markdown.`
            },
            {
              role: 'user',
              content: `Create a stunning, Awwwards-quality single page website for ${businessName}.

Business: ${businessName}
Description: ${businessDescription || 'A professional business'}
Style: ${templatePrompts[template] || 'modern and professional'}

DESIGN REQUIREMENTS:
- Use Google Fonts — combine a serif display font with a clean sans-serif
- Premium color palette — dark backgrounds (#0a0a0a, #111111) with ONE bold accent color
- Large, bold hero section with an attention grabbing headline
- Smooth CSS animations — fade ins, slide ups, parallax effects
- Bento grid layout for services/features section
- Glassmorphism cards with backdrop-filter blur
- Magnetic hover effects on buttons
- Custom cursor effect
- Smooth scroll behavior
- Micro interactions on all interactive elements

SECTIONS REQUIRED:
1. Navigation — fixed, blur background on scroll, logo + links + CTA button
2. Hero — full viewport height, bold headline, subheadline, two CTAs, animated background
3. About — story section with stats/numbers
4. Services/Features — bento grid layout with icons
5. Process — how it works, numbered steps
6. Testimonials — clean cards with ratings
7. FAQ — accordion style
8. Contact — form with modern styling
9. Footer — links, social icons, copyright

TECHNICAL REQUIREMENTS:
- Single HTML file with all CSS and JS inline
- CSS custom properties for design tokens
- Intersection Observer for scroll animations
- Smooth scroll with offset for fixed nav
- Form validation with visual feedback
- Mobile hamburger menu
- All images replaced with beautiful CSS gradients or SVG illustrations
- Optimized for 95+ Lighthouse score

Return ONLY the complete HTML starting with <!DOCTYPE html>. Nothing else.`
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'Failed to generate site' }, { status: 500 })
    }

    const data = await response.json()
    const html = data.choices[0].message.content

    const cleanHtml = html.replace(/```html/g, '').replace(/```/g, '').trim()

    return NextResponse.json({ html: cleanHtml })

  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}