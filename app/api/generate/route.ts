import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { businessName, offering, targetCustomer, goal, brandFeel, template, businessDescription } = await req.json()

  if (!businessName) {
    return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
  }

  // ── Build state object from brief ──────────────────────────────
  const ACCENT_COLORS: Record<string, string> = {
    agency:     '#C8FF00',
    restaurant: '#FF6B35',
    portfolio:  '#A855F7',
    ecommerce:  '#00D4FF',
    saas:       '#FF3366',
  }

  const state = {
    brief: {
      businessName,
      offering:       offering       ?? '',
      targetCustomer: targetCustomer ?? '',
      goal:           goal           ?? '',
      brandFeel:      brandFeel      ?? '',
      template,
    },
    theme: {
      accentColor: ACCENT_COLORS[template?.toLowerCase()] ?? '#C8FF00',
      background:  '#0a0a0a',
      fontDisplay: 'Syne',
      fontBody:    'Inter',
    },
    sections: [
      { id: 'nav_01',          type: 'nav',          variant: 'sticky-blur'  },
      { id: 'hero_01',         type: 'hero',         variant: 'full-bleed'   },
      { id: 'social_proof_01', type: 'social_proof', variant: 'ticker'       },
      { id: 'features_01',     type: 'features',     variant: 'bento'        },
      { id: 'about_01',        type: 'about',        variant: 'split'        },
      { id: 'testimonials_01', type: 'testimonials', variant: 'cards'        },
      { id: 'pricing_01',      type: 'pricing',      variant: 'cards'        },
      { id: 'cta_01',          type: 'cta',          variant: 'banner'       },
      { id: 'footer_01',       type: 'footer',       variant: 'minimal'      },
    ],
    version: 1,
  }

  // ── Prompts ────────────────────────────────────────────────────
  const systemPrompt = `You are the world's best UI/UX designer and frontend developer combined. You have won multiple Awwwards Site of the Day awards. Your websites are featured in design inspiration galleries worldwide.

Your output is ALWAYS a single complete HTML file — no markdown, no explanation, no code fences. Just raw HTML starting with <!DOCTYPE html>.

═══ DESIGN RULES (never break these) ═══

TYPOGRAPHY:
- Load 2 Google Fonts via @import: one dramatic display font (Syne, Playfair Display, Cormorant Garamond, Bebas Neue, etc) and one clean body font (Inter, DM Sans, etc)
- Use fluid typography with clamp() everywhere: clamp(2.5rem, 8vw, 7rem) for headings
- Tight letter-spacing on headings: -0.03em to -0.05em
- Line height 0.9–1.0 for big headings, 1.6–1.7 for body text
- Font weights: 900 for display, 400/500 for body

LAYOUT:
- NO generic hero → features → testimonials → footer pattern
- Use unexpected layouts: asymmetric grids, full-bleed sections, overlapping elements
- Bento grid layouts for feature sections
- Horizontal scrolling sections where appropriate
- Large whitespace and breathing room
- CSS Grid and Flexbox only — no frameworks

COLOR:
- Dark backgrounds (#0a0a0a, #050505, #0f0f0f) unless business is clearly light-themed
- One strong accent color that fits the brand personality
- Subtle gradients and glassmorphism effects
- Text: pure white #ffffff with opacity variations (0.8, 0.5, 0.3) for hierarchy

ANIMATIONS & INTERACTIONS:
- CSS keyframe animations on page load: fade up, fade in, slide in
- Smooth hover states on every interactive element
- Magnetic-feel button hover with transform and box-shadow
- Parallax-style background elements using CSS
- Staggered animation delays on lists and grids
- Smooth scroll behavior

SECTION IDs (critical — never skip this):
- Every major section MUST have a data-section attribute with its ID
- Use exactly these IDs: nav_01, hero_01, social_proof_01, features_01, about_01, testimonials_01, pricing_01, cta_01, footer_01
- Example: <section data-section="hero_01"> ... </section>
- This is required for the editing system to work

COMPONENTS TO ALWAYS INCLUDE:
1. Sticky nav with blur backdrop: backdrop-filter: blur(20px)
2. Hero section with animated headline, subtext, and 2 CTAs
3. Social proof bar (logos or stats ticker)
4. Features/services in a bento or asymmetric grid
5. About section with personality
6. Testimonials (3 real-sounding ones specific to the business)
7. Pricing or process section
8. Strong CTA banner section
9. Footer with links and copyright

COPY RULES:
- Write real, specific, compelling copy for this exact business
- Headlines should be punchy and emotional, not descriptive
- Never use Lorem Ipsum — ever
- Testimonials must have real, culturally diverse names from around the world and feel authentic
- Include real-looking phone numbers, addresses, and emails

TECHNICAL:
- Fully self-contained: all CSS and JS inline
- Zero external dependencies except Google Fonts
- Mobile-first responsive with proper breakpoints (768px, 1024px)
- CSS custom properties (variables) for the color system
- Semantic HTML5 elements
- Images: use CSS gradients, geometric shapes, or SVG patterns instead of <img> tags
- Working contact form UI with styled inputs and button
- Smooth scroll on anchor links

QUALITY BAR:
Every single section must look intentional and designed. No section should feel like a template. The website must feel like it was built specifically and only for this business. A professional designer should look at it and be impressed.`

  const userPrompt = `Build a complete, stunning website for this business:

Business Name: ${businessName}
Template Style: ${template}
What they offer: ${offering}
Target customer: ${targetCustomer}
Primary website goal: ${goal}
Brand feel: ${brandFeel}
${businessDescription ? `Additional context: ${businessDescription}` : ''}

Design direction based on template:
${template === 'agency'     ? '- Bold, editorial feel. Black and neon accent. Typography-forward. Big headlines.' : ''}
${template === 'restaurant' ? '- Warm, appetizing. Rich dark tones with warm amber/gold accents. Food-focused copy.' : ''}
${template === 'portfolio'  ? '- Minimal, sophisticated. Let the work breathe. Strong personal brand voice.' : ''}
${template === 'ecommerce'  ? '- Clean, conversion-focused. Product-first. Clear CTAs. Trust signals.' : ''}
${template === 'saas'       ? '- Modern, technical but friendly. Dashboard previews. Feature-focused. Growth-oriented.' : ''}

Remember: every section must have its data-section attribute. Start with <!DOCTYPE html> and nothing else.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Generation failed', detail: err }, { status: 500 })
    }

    const data  = await response.json()
    const html  = data.content?.[0]?.text ?? ''
    const clean = html.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim()

    return NextResponse.json({ html: clean, state })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}