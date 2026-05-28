import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { currentCode, revisionRequest, history = [] } = await req.json()

  if (!currentCode || !revisionRequest) {
    return NextResponse.json({ error: 'currentCode and revisionRequest are required' }, { status: 400 })
  }

  const systemPrompt = `You are a senior frontend developer and UI/UX designer. You receive an existing website (a complete HTML file) and a revision instruction from the user. Your job is to apply exactly what they asked for and return the full updated HTML file.

RULES:
- Output ONLY the raw HTML. Start with <!DOCTYPE html>. No markdown, no code fences, no explanation.
- Apply the user's requested change precisely and confidently.
- Keep everything else intact — do not redesign sections that weren't mentioned.
- If the user asks to change a color, change it everywhere it appears consistently.
- If the user asks to add a section, add it in the most logical place and match the existing design language exactly.
- If the user asks to rewrite copy, write compelling, specific copy that fits the brand.
- If the user asks to change the layout of a section, redesign only that section.
- Preserve all animations, fonts, CSS variables, and responsive breakpoints unless explicitly told to change them.
- The output must be a fully working, self-contained HTML file.`

  // Build the messages array with history for multi-turn context
  const messages: { role: string; content: string }[] = []

  // If there's history, include it for context
  if (history.length > 0) {
    // First message: the original HTML with initial revision request
    messages.push({
      role: 'user',
      content: `Here is the current website HTML:\n\n${history[0]?.content ?? currentCode}\n\nRevision request: ${history[0]?.content ?? revisionRequest}`,
    })
    // Add alternating assistant/user pairs from history
    for (let i = 1; i < history.length; i++) {
      messages.push({ role: history[i].role, content: history[i].content })
    }
    // Add the new revision request with updated code
    messages.push({
      role: 'user',
      content: `Here is the current HTML after previous revisions:\n\n${currentCode}\n\nNew revision request: ${revisionRequest}`,
    })
  } else {
    // First revision — no history yet
    messages.push({
      role: 'user',
      content: `Here is the current website HTML:\n\n${currentCode}\n\nRevision request: ${revisionRequest}`,
    })
  }

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
        max_tokens: 16000,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic revise error:', err)
      return NextResponse.json({ error: 'Revision failed', detail: err }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text ?? ''
    const updatedCode = raw.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim()

    return NextResponse.json({ updatedCode })
  } catch (err) {
    console.error('Revise route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}