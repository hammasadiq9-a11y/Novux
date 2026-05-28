import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { name, template, html, state, userId } = await req.json()

  if (!name || !html || !userId) {
    return NextResponse.json({ error: 'name, html and userId are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id:    userId,
      name,
      template,
      content:    { html },
      state,
      published:  false,
    })
    .select()
    .single()

  if (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }

  return NextResponse.json({ project: data })
}