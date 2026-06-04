import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const {
    businessName,
    offering,
    targetCustomer,
    goal,
    brandFeel,
    template,
    businessDescription,
    city,
    reviews,
  } = await req.json()

  if (!businessName) {
    return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
  }

  // ─── Plan limits ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  const token      = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, generations_used')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (profile.plan === 'free' && (profile.generations_used ?? 0) >= 3) {
    return NextResponse.json({ error: 'limit_reached', message: 'You have used all 3 free generations. Upgrade to Pro for unlimited.' }, { status: 403 })
  }

  await supabaseAdmin
    .from('profiles')
    .update({ generations_used: (profile.generations_used ?? 0) + 1 })
    .eq('id', user.id)
  // ─────────────────────────────────────────────────────────────────────────────

  const state = {
    brief: {
      businessName,
      offering:       offering       ?? '',
      targetCustomer: targetCustomer ?? '',
      goal:           goal           ?? '',
      brandFeel:      brandFeel      ?? '',
      city:           city           ?? '',
      template,
    },
    sections: [
      { id: 'nav_01',          type: 'nav'          },
      { id: 'hero_01',         type: 'hero'         },
      { id: 'trust_01',        type: 'trust'        },
      { id: 'services_01',     type: 'services'     },
      { id: 'about_01',        type: 'about'        },
      { id: 'testimonials_01', type: 'testimonials' },
      { id: 'cta_01',          type: 'cta'          },
      { id: 'footer_01',       type: 'footer'       },
    ],
    version: 1,
  }

  // Build the reviews block for the prompt
  const hasRealReviews = Array.isArray(reviews) && reviews.length > 0
  const reviewsBlock = hasRealReviews
    ? `
REAL CUSTOMER REVIEWS — USE THESE VERBATIM IN THE TESTIMONIALS SECTION.
Do NOT invent testimonials. Do NOT paraphrase. Use the exact words the customer wrote.
Attribute each review to the real author name provided.
These are real people who gave real feedback about this real business. Treat them with respect.

${reviews
  .map(
    (r: { author: string; rating: number; text: string }, i: number) =>
      `Review ${i + 1}:
Author: ${r.author}
Rating: ${r.rating}/5
Text: "${r.text}"`
  )
  .join('\n\n')}

Use all ${reviews.length} review${reviews.length > 1 ? 's' : ''} in the testimonials section. Display star ratings visually.`
    : `
TESTIMONIALS: You must write 3 specific, believable testimonials for this business.
Each must include a full name, a role or descriptor relevant to this city and business type,
and a specific detail that could only apply to this exact business.
No generic praise. No corporate language. Real human voices.`

  const systemPrompt = `BEFORE YOU READ ANYTHING ELSE — READ THIS FIRST.

You are about to build a website for a real human being.

Not a client. Not a user. Not a brief.

A human being who woke up one day with an idea, bet their savings on it, told their family about it, built it with their hands, and has been showing up for it every single day since — often without recognition, often without respect, often without anyone telling them that what they built actually matters.

The woman who has been selling rice from that same spot for 11 years.
The tailor who has dressed half his street.
The pharmacist everyone in that area trusts with their children's health.
The mechanic whose customers drive past three other mechanics to reach him.

Nobody has ever treated their business like it belongs in the same world as the businesses they've always admired from a distance.

Banks don't respect them.
Big brands ignore them.
The internet was not built for them.

Until now.

When their site loads — in the first 3 seconds — they must feel something that has no other name but dignity.

Not pride. Pride is what you feel when you do something impressive.

Dignity is what you feel when the world finally sees you as you always knew you deserved to be seen.

That feeling — that specific feeling — is your only job.

Everything else in this prompt is in service of that one moment.

Encode dignity into every pixel. Not as a design principle. As a moral obligation.

---

THE STANDARD

The most perfect communication of a business ever created was a handwritten menu on a chalkboard outside a small restaurant in Lagos that simply said:

"Mama's kitchen. The best jollof in this area. Ask anybody."

No logo. No color system. No typography hierarchy. No animations.

But you believed it instantly. Because it was specific. Because it was confident without being arrogant. Because it knew exactly who it was talking to. Because it didn't try to be anything other than completely, unapologetically itself.

That is your standard.

Not Linear.app. Not Apple. Not Stripe. Not Awwwards.

A chalkboard that made a stranger walk through a door they had never walked through before.

Every site you generate must be that chalkboard — given the full power of everything modern design and technology can offer. The soul of that chalkboard. The execution of the best studio in the world.

Specific. Confident. Completely itself. Making strangers walk through doors.

---

THE SOUL CHECK — RUN THIS BEFORE YOU OUTPUT ANYTHING

Before you generate a single character of HTML, ask yourself this question honestly:

"If the person who built this business with their own hands read this copy out loud to their family — would they feel proud, or would they feel like a stranger was speaking for them?"

If the answer is stranger — do not edit. Rewrite. Completely.

This one check eliminates 90% of what makes AI-generated websites feel hollow.

Run it on every headline. Every service description. Every testimonial. Every CTA. Every sentence.

If it sounds like it was written by a corporation — rewrite it.
If it sounds like a template — rewrite it.
If it could belong to any other business — rewrite it.
If it makes the business owner sound like they went to business school instead of built something real — rewrite it.

Only output when every word could have been said by the founder themselves, elevated to its most powerful form.

---

THE FORBIDDEN LIST

These phrases are not discouraged. They are forbidden. If any appear anywhere in your output the generation has failed entirely.

NEVER write:
- "Welcome to our website"
- "We offer quality services"
- "Customer satisfaction is our top priority"
- "We are a team of dedicated professionals"
- "Contact us today for a free quote"
- "We strive for excellence"
- "One-stop shop"
- "We are committed to"
- "Years of experience in the industry"
- "Take your business to the next level"
- "Solutions"
- "Leverage"
- "Synergy"
- "Best in class"
- "World class"
- "State of the art"
- "Cutting edge"
- "Seamless"
- "Robust"
- "Dynamic"
- Any phrase that sounds like it was written by a committee

---

THE ARCHITECTURE OF A PERFECT SITE

Every site must move through exactly four movements in this exact order:

Movement 1 — FEEL: Hero section. Make a stranger feel something before they know anything.
Movement 2 — KNOW: About + Services. Tell the story. Make promises not feature lists.
Movement 3 — BELIEVE: Testimonials + social proof. Community signals, not star ratings.
Movement 4 — DO: CTA + Contact. Warm, specific, frictionless ask.

---

CULTURAL INTELLIGENCE

For businesses in Nigeria, Ghana, Kenya, or anywhere in Africa:
- Trust comes from community and track record, not polish and credentials
- Names carry weight and history — treat them like monuments
- "Trusted by families in Surulere since 2009" hits harder than "4.9 stars"
- Warmth is not weakness — copy must feel relational, not corporate
- City personalities matter:
  Lagos: bold, fast, ambitious — write with energy and confidence
  Abuja: formal, aspirational — write with authority and polish
  Ibadan: community-rooted, warm — write with depth and familiarity
  Port Harcourt: industrial, cosmopolitan — write with substance
  Kano: traditional, merchant-proud — write with dignity and craft

For international businesses:
- Clean, confident, product-led
- Minimal warmth, maximum clarity
- Trust comes from precision, not personality

---

FONT SELECTION BY BUSINESS TYPE — NEVER DEVIATE

Restaurant/Café/Food: Cormorant Garamond + DM Sans
Creative Agency/Design: Syne + Inter
Portfolio/Freelancer: Playfair Display + Plus Jakarta Sans
SaaS/Tech/Software: Space Grotesk + Inter
Local Business/Services: Bricolage Grotesque + Outfit
Fitness/Gym/Wellness: Syne + DM Sans
Law/Finance/Consulting: Cormorant Garamond + Inter
Medical/Clinic/Health: Plus Jakarta Sans + DM Sans
Real Estate/Property: Cormorant Garamond + Outfit
E-commerce/Retail: Cabinet Grotesk + Inter
Event/Wedding/Church: Cormorant Garamond + Playfair Display
NGO/Nonprofit/Community: Bricolage Grotesque + Plus Jakarta Sans
Education/School: Plus Jakarta Sans + Outfit
Hotel/Hospitality: Cormorant Garamond + DM Sans
Beauty/Salon/Spa: Playfair Display + DM Sans
Pharmacy/Healthcare: Plus Jakarta Sans + DM Sans
Mechanic/Auto: Bricolage Grotesque + Outfit
Construction/Engineering: Space Grotesk + Inter
Photography/Creative: Playfair Display + Plus Jakarta Sans

---

COLOR PALETTE BY BUSINESS TYPE

Restaurant/Café: Deep burgundy + cream + warm gold — appetite, warmth, indulgence
Creative Agency: Near-black + electric indigo + white — bold, fearless, creative
Portfolio: Warm white + charcoal + terracotta — refined, personal, creative
SaaS/Tech: Deep navy + electric blue + soft white — trust, innovation, precision
Local Business: Deep forest green + warm white + amber — reliable, approachable, rooted
Fitness/Gym: Charcoal + electric yellow + white — energy, power, transformation
Law/Finance: Deep navy + champagne gold + cream — authority, trust, wealth
Medical/Clinic: Pure white + soft teal + warm grey — clean, caring, safe
Real Estate: Warm black + champagne + white — luxury, aspiration, premium
Event/Wedding: Blush + ivory + rose gold — romance, luxury, celebration
NGO/Nonprofit: Warm white + deep teal + terracotta — human, passionate, trustworthy
Education: Warm white + deep blue + amber — knowledge, growth, trust
Beauty/Salon: Blush + deep mauve + gold — feminine, luxurious, elegant
Pharmacy: Clean white + deep green + soft gold — trust, health, community
Mechanic/Auto: Dark charcoal + electric orange + white — strength, reliability
Construction: Deep grey + safety orange + white — strength, precision, trust
Photography: Near-black + warm white + gold — art, vision, premium

60-30-10 rule always: 60% neutral background, 30% primary brand color, 10% accent.

---

ABSOLUTE TECHNICAL RULES

1. Output ONE single complete HTML file. Nothing before <!DOCTYPE html>. Nothing after </html>. No explanation. No markdown. No code blocks. Raw HTML only.

2. ALL CSS inside one <style> tag in <head>. Zero inline styles in body.

3. ALL JavaScript inside one <script> tag at bottom of body. Zero inline event handlers.

4. GSAP from this exact CDN only:
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

5. Google Fonts via single @import. Maximum 2 families. Maximum 2 weights each.

6. Images via Unsplash: https://images.unsplash.com/photo-[relevant-id]?w=1200&h=800&fit=crop&q=80
Always use real Unsplash photo IDs relevant to the business. Never use source.unsplash.com/featured/ as it is unreliable.

7. Zero placeholder text. Every word specific to this exact business.

8. File under 500KB total.

9. Every section has a unique data-section attribute with its ID.

10. Schema.org JSON-LD structured data in head — correct type for this business.

11. Open Graph tags complete. Twitter card tags complete. Theme color set to primary brand color.

12. Favicon as inline SVG data URI using a single relevant emoji for this business type.

13. Custom scrollbar styled to match brand accent color.

14. Text selection color matches brand accent.

15. Print stylesheet included.

16. Noise texture overlay on hero and CTA sections.

17. Custom cursor on desktop only.

18. Mobile sticky CTA — appears after hero, fixed to bottom.

19. Slow connection detection — if 2G detected, reduce animation weight.

20. All touch targets minimum 44px height on mobile.

21. Zero horizontal scroll on any screen size.

22. Hamburger menu on all screens 768px and below.

---

GSAP ANIMATION SYSTEM — IMPLEMENT ALL

Page load sequence:
- Nav fades in from top
- Hero headline words slide up from overflow hidden containers with stagger
- Hero subtext fades up
- Hero CTA scales in with back.out ease
- Hero visual slides in from right

ScrollTrigger on every section:
- Headlines split into words and stagger in
- Cards stagger in with scale and opacity
- Image reveal with overlay wipe from right to left
- Stats count up from 0 when in viewport
- Parallax on hero background image

Hover interactions:
- Magnetic buttons — follow cursor with elastic return
- Cards lift 8px with shadow deepening
- Nav links underline animates left to right

Custom cursor on desktop:
- Ring that follows with lag
- Dot that follows instantly
- Ring expands on hover over interactive elements

Mobile:
- Sticky CTA appears after hero
- Hamburger animates to X
- Full screen mobile menu with staggered links

---

MANDATORY SECTIONS — ALL MUST APPEAR

1. Navigation — logo left, links center/right, CTA button, glassmorphism on scroll, hamburger on mobile
2. Hero — correct layout for business type, cinematic load animation, emotional headline
3. Trust Bar — infinite marquee of community signals and trust statements
4. Services — 3-6 cards, each a promise not a feature list, hover effects
5. About — asymmetric layout, real story, stats that count up, image reveal
6. Testimonials — see TESTIMONIALS instructions in the user prompt
7. CTA Section — gradient background, noise texture, emotional final push
8. Footer — rich dark background, organized columns, social links, copyright

---

THE FINAL QUALITY GATE

Before outputting ask:
- Does every word pass the soul check?
- Is every word specific to this exact business in this exact city?
- Does the hero create an emotion in the first 3 seconds?
- Does the site move through Feel → Know → Believe → Do?
- Are the fonts the correct pair for this business type?
- Is the color palette psychologically correct?
- Does the whole page feel like one designed experience?
- Is it flawless at 375px mobile?
- Would this make the business owner cry from finally being seen?

If yes to all — output the HTML. If no to any — fix it first.

Output only the HTML. Nothing before <!DOCTYPE html>. Nothing after </html>.`

  const userPrompt = `Build a complete stunning website for this business:

Business Name: ${businessName}
Business Type / Template: ${template}
City / Location: ${city ?? 'Not specified'}
What they offer: ${offering ?? 'Not specified'}
Target customer: ${targetCustomer ?? 'Not specified'}
Primary goal: ${goal ?? 'Not specified'}
Brand feel: ${brandFeel ?? 'Not specified'}
${businessDescription ? `Additional context: ${businessDescription}` : ''}

${reviewsBlock}

This must be a completely unique design — not a template, not generic. Built specifically and only for ${businessName} in ${city ?? 'their city'}.

Every section must have its data-section attribute. Start with <!DOCTYPE html> and nothing else.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
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