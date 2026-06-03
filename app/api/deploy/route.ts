import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CF_ACCOUNT  = process.env.CLOUDFLARE_ACCOUNT_ID!
const CF_TOKEN    = process.env.CLOUDFLARE_API_TOKEN!
const CF_BASE     = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cfHeaders() {
  return {
    'Authorization': `Bearer ${CF_TOKEN}`,
    'Content-Type':  'application/json',
  }
}

// Slugify a business name into a valid Cloudflare project name
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

// Create a Cloudflare Pages project (only needed once per site)
async function ensureProject(slug: string): Promise<{ ok: boolean; error?: string }> {
  // Check if project already exists
  const check = await fetch(`${CF_BASE}/pages/projects/${slug}`, {
    headers: cfHeaders(),
  })

  if (check.ok) return { ok: true } // already exists

  // Create it
  const create = await fetch(`${CF_BASE}/pages/projects`, {
    method:  'POST',
    headers: cfHeaders(),
    body: JSON.stringify({
      name:              slug,
      production_branch: 'main',
    }),
  })

  if (!create.ok) {
    const err = await create.json()
    return { ok: false, error: err.errors?.[0]?.message ?? 'Failed to create project' }
  }

  return { ok: true }
}

// Deploy HTML as a Cloudflare Pages Direct Upload
async function deployHTML(slug: string, html: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Step 1 — create a deployment upload
  const uploadRes = await fetch(`${CF_BASE}/pages/projects/${slug}/deployments`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${CF_TOKEN}` },
    // Multipart form with the HTML file
    body: (() => {
      const form = new FormData()
      const manifest = JSON.stringify({ '/index.html': await hashString(html) })
      form.append('manifest', manifest)
      form.append('files', new Blob([html], { type: 'text/html' }), 'index.html')
      return form
    })(),
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    return { ok: false, error: err.errors?.[0]?.message ?? 'Upload failed' }
  }

  const uploadData = await uploadRes.json()
  const deployId   = uploadData.result?.id

  if (!deployId) return { ok: false, error: 'No deployment ID returned' }

  const url = `https://${slug}.pages.dev`
  return { ok: true, url }
}

// Simple hash for CF manifest (sha256 hex)
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data     = encoder.encode(str)
  const hashBuf  = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { html, businessName, projectId, userId } = await req.json()

    if (!html || !businessName) {
      return NextResponse.json({ error: 'html and businessName are required' }, { status: 400 })
    }

    if (!CF_ACCOUNT || !CF_TOKEN) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 })
    }

    const slug = toSlug(businessName)

    // 1 — Ensure the CF Pages project exists
    const project = await ensureProject(slug)
    if (!project.ok) {
      return NextResponse.json({ error: project.error }, { status: 502 })
    }

    // 2 — Deploy the HTML
    const deploy = await deployDirect(slug, html)
    if (!deploy.ok) {
      return NextResponse.json({ error: deploy.error }, { status: 502 })
    }

    const liveUrl = deploy.url!

    // 3 — Save deployment record to Supabase
    if (projectId && userId) {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await sb.from('deployments').insert({
        project_id: projectId,
        user_id:    userId,
        url:        liveUrl,
        platform:   'cloudflare',
        slug,
        deployed_at: new Date().toISOString(),
      })
      // Also update the project record
      await sb.from('projects').update({ deployed_url: liveUrl, slug }).eq('id', projectId)
    }

    return NextResponse.json({ url: liveUrl, slug })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: 'Deployment failed' }, { status: 500 })
  }
}

// ─── Direct upload via multipart form ─────────────────────────────────────────
async function deployDirect(slug: string, html: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const htmlHash = await hashString(html)

    const form = new FormData()
    form.append('manifest', JSON.stringify({ '/index.html': htmlHash }))
    form.append(
      htmlHash,
      new Blob([html], { type: 'text/html' }),
      'index.html',
    )

    const res = await fetch(
      `${CF_BASE}/pages/projects/${slug}/deployments`,
      {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${CF_TOKEN}` },
        body:    form,
      },
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err.errors?.[0]?.message ?? `CF error ${res.status}` }
    }

    return { ok: true, url: `https://${slug}.pages.dev` }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}