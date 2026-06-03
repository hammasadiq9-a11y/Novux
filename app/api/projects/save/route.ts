import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { name, template, html, state, userId, city, offering, targetCustomer, goal, brandFeel } = await req.json()

  if (!name || !html || !userId) {
    return NextResponse.json({ error: 'name, html and userId are required' }, { status: 400 })
  }

  const preview_token = randomBytes(24).toString('hex')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id:         userId,
      name,
      template,
      html,
      state,
      city:            city           ?? '',
      offering:        offering       ?? '',
      target_customer: targetCustomer ?? '',
      goal:            goal           ?? '',
      brand_feel:      brandFeel      ?? '',
      project_status:  'draft',
      preview_token,
    })
    .select()
    .single()

  if (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }

  await supabase.rpc('increment_generations', { user_id_input: userId })

  return NextResponse.json({ project: data })
}