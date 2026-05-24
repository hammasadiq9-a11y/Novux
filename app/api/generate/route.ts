import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { businessName, businessDescription, template } = await req.json()

  if (!businessName) {
    return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
  }

  const systemPrompt = `You are an elite web designer who builds Awwwards-winning websites.
Your output is ALWAYS a single complete HTML file — no markdown, no explanation, no code fences.
Just raw HTML starting with <!DOCTYPE html>.

Rules you NEVER break:
- Fully self-contained: all CSS and JS inline, zero external dependencies except Google Fonts
- Mobile-first and fully responsive
- Dark, premium aesthetic unless the business clearly calls for light
- Unique layout — no generic hero/features/footer cookie-cutter patterns
- Beautiful typography using Google Fonts (load via @import in <style>)
- Smooth CSS animations and micro-interactions
- Real, specific copy written for this exact business — never placeholder Lorem Ipsum
- All sections filled with meaningful content: hero, about, services/products, testimonials, contact
- Working contact form UI (no backend needed, just the form)
- A distinct color palette that fits the business personality
- The output must look like it cost $10,000 to build`

  const userPrompt = `Build a complete website for this business:

Business Name: ${businessName}
Template Style: ${template}
${businessDescription ? `About the Business: ${businessDescription}` : ''}

Deliver only the raw HTML file. Start your response with <!DOCTYPE html> and nothing else.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Generation failed', detail: err }, { status: 500 })
    }

    const data = await response.json()
    const html = data.content?.[0]?.text ?? ''
    const clean = html.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim()

    return NextResponse.json({ html: clean })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}