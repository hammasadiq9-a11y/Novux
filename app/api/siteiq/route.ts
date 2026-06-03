import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckStatus = 'pass' | 'warn' | 'fail'

interface Check {
  id:     string
  label:  string
  status: CheckStatus
  detail: string
  points: number   // how many points this check contributes
  earned: number   // how many points were actually earned
}

interface Category {
  id:     string
  label:  string
  checks: Check[]
  score:  number   // 0–100
}

export interface SiteIQResult {
  overall:    number
  categories: Category[]
  generated:  string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function check(id: string, label: string, points: number, passed: boolean, warnCondition?: boolean, detail: string = '', warnDetail: string = '', failDetail: string = ''): Check {
  const status: CheckStatus = passed ? 'pass' : warnCondition ? 'warn' : 'fail'
  const earned = passed ? points : warnCondition ? Math.round(points * 0.6) : 0
  return {
    id, label, status, points, earned,
    detail: passed ? detail : warnCondition ? warnDetail : failDetail,
  }
}

function score(checks: Check[]): number {
  const total  = checks.reduce((a, c) => a + c.points, 0)
  const earned = checks.reduce((a, c) => a + c.earned, 0)
  return total > 0 ? Math.round((earned / total) * 100) : 0
}

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseHTML(html: string) {
  // Meta tags
  const metaTitle       = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
  const metaDesc        = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? ''
  const metaOgTitle     = /<meta[^>]+property=["']og:title["']/i.test(html)
  const metaOgDesc      = /<meta[^>]+property=["']og:description["']/i.test(html)
  const metaOgImage     = /<meta[^>]+property=["']og:image["']/i.test(html)
  const metaTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html)
  const metaViewport    = /<meta[^>]+name=["']viewport["']/i.test(html)
  const metaThemeColor  = /<meta[^>]+name=["']theme-color["']/i.test(html)
  const canonical       = /<link[^>]+rel=["']canonical["']/i.test(html)
  const schemaLD        = /<script[^>]+type=["']application\/ld\+json["']/i.test(html)
  const favicon         = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html)

  // Headings
  const h1s    = (html.match(/<h1[^>]*>/gi) ?? []).length
  const h2s    = (html.match(/<h2[^>]*>/gi) ?? []).length
  const h3s    = (html.match(/<h3[^>]*>/gi) ?? []).length

  // Images
  const imgTags      = html.match(/<img[^>]+>/gi) ?? []
  const imgTotal     = imgTags.length
  const imgWithAlt   = imgTags.filter(t => /alt=["'][^"']+["']/i.test(t)).length
  const imgMissingAlt = imgTotal - imgWithAlt
  const imgLazy      = imgTags.filter(t => /loading=["']lazy["']/i.test(t)).length
  const imgWebP      = imgTags.filter(t => /\.webp/i.test(t)).length

  // Links
  const links        = html.match(/<a[^>]+>/gi) ?? []
  const linksTotal   = links.length
  const linksNoText  = links.filter(t => !/>([\s\S]+?)<\/a>/i.test(t)).length // rough

  // Scripts & styles
  const inlineScripts  = (html.match(/<script(?![^>]+src)[^>]*>/gi) ?? []).length
  const externalScripts= (html.match(/<script[^>]+src=["'][^"']+["']/gi) ?? []).length
  const inlineStyles   = (html.match(/style=["'][^"']+["']/gi) ?? []).length
  const styleTag       = /<style[^>]*>/i.test(html)
  const gsapLoaded     = /gsap/i.test(html)
  const scrollTrigger  = /ScrollTrigger/i.test(html)

  // Sections
  const hasNav         = /<nav[\s>]/i.test(html)
  const hasHero        = /hero|banner/i.test(html)
  const hasFooter      = /<footer[\s>]/i.test(html)
  const hasTestimonials= /testimonial|review/i.test(html)
  const hasCTA         = /cta|call.to.action/i.test(html)
  const hasAbout       = /about/i.test(html)
  const hasServices    = /service|offering/i.test(html)

  // Accessibility
  const ariaLabels    = (html.match(/aria-label=/gi) ?? []).length
  const ariaRoles     = (html.match(/role=["'][^"']+["']/gi) ?? []).length
  const skipLink      = /skip.to.main|skip.navigation/i.test(html)
  const langAttr      = /<html[^>]+lang=["']/i.test(html)
  const inputLabels   = (html.match(/<label[^>]*for=/gi) ?? []).length
  const inputs        = (html.match(/<input[^>]+>/gi) ?? []).length

  // Performance signals
  const htmlSize      = html.length
  const hasPreload    = /<link[^>]+rel=["']preload["']/i.test(html)
  const fontDisplay   = /font-display:\s*swap/i.test(html)
  const animCount     = (html.match(/gsap\.to|gsap\.from|gsap\.fromTo|ScrollTrigger\.create/gi) ?? []).length

  // Conversion signals
  const ctaButtons    = (html.match(/<button[^>]*>|<a[^>]+class=["'][^"']*btn[^"']*["']/gi) ?? []).length
  const hasPhone      = /tel:|phone/i.test(html)
  const hasEmail      = /mailto:/i.test(html)
  const hasForm       = /<form[\s>]/i.test(html)
  const hasSocialProof= /testimonial|review|trust|client/i.test(html)
  const hasFAQ        = /faq|frequently.asked/i.test(html)
  const hasPricing    = /price|pricing|₦|NGN|\$[0-9]/i.test(html)

  return {
    metaTitle, metaDesc, metaOgTitle, metaOgDesc, metaOgImage, metaTwitterCard,
    metaViewport, metaThemeColor, canonical, schemaLD, favicon,
    h1s, h2s, h3s,
    imgTotal, imgWithAlt, imgMissingAlt, imgLazy, imgWebP,
    linksTotal, linksNoText,
    inlineScripts, externalScripts, inlineStyles, styleTag, gsapLoaded, scrollTrigger,
    hasNav, hasHero, hasFooter, hasTestimonials, hasCTA, hasAbout, hasServices,
    ariaLabels, ariaRoles, skipLink, langAttr, inputLabels, inputs,
    htmlSize, hasPreload, fontDisplay, animCount,
    ctaButtons, hasPhone, hasEmail, hasForm, hasSocialProof, hasFAQ, hasPricing,
  }
}

// ─── Score builder ────────────────────────────────────────────────────────────
function buildSEO(p: ReturnType<typeof parseHTML>): Category {
  const checks: Check[] = [
    check('title', 'Meta Title', 15,
      !!p.metaTitle && p.metaTitle.length >= 10 && p.metaTitle.length <= 60,
      !!p.metaTitle,
      `"${p.metaTitle.slice(0, 50)}${p.metaTitle.length > 50 ? '…' : ''}" · ${p.metaTitle.length} chars`,
      `Present but ${p.metaTitle.length > 60 ? 'too long — trim to 60 chars' : 'too short — aim for 30–60 chars'}`,
      'Missing — add a <title> tag',
    ),
    check('description', 'Meta Description', 12,
      !!p.metaDesc && p.metaDesc.length >= 100 && p.metaDesc.length <= 160,
      !!p.metaDesc,
      `${p.metaDesc.length} chars — good length`,
      `${p.metaDesc.length} chars — ${p.metaDesc.length > 160 ? 'trim to 160' : 'aim for 100–160 chars'}`,
      'Missing meta description',
    ),
    check('h1', 'Single H1', 10,
      p.h1s === 1,
      p.h1s > 1,
      '1 H1 found — correct',
      `${p.h1s} H1 tags found — use exactly one`,
      'No H1 tag found',
    ),
    check('headings', 'Heading Structure', 8,
      p.h2s >= 2 && p.h3s >= 1,
      p.h2s >= 1,
      `H2: ${p.h2s} · H3: ${p.h3s} — good structure`,
      `H2: ${p.h2s} · H3: ${p.h3s} — add more subheadings`,
      'No H2 or H3 tags found',
    ),
    check('alttext', 'Image Alt Text', 10,
      p.imgTotal === 0 || p.imgMissingAlt === 0,
      p.imgMissingAlt <= 2,
      p.imgTotal === 0 ? 'No images to check' : `All ${p.imgTotal} images have alt text`,
      `${p.imgMissingAlt} of ${p.imgTotal} images missing alt text`,
      `${p.imgMissingAlt} of ${p.imgTotal} images missing alt text`,
    ),
    check('schema', 'Schema.org JSON-LD', 12,
      p.schemaLD,
      false,
      'Structured data found',
      '',
      'No JSON-LD schema found — add LocalBusiness or relevant type',
    ),
    check('og', 'Open Graph Tags', 8,
      p.metaOgTitle && p.metaOgDesc && p.metaOgImage,
      p.metaOgTitle || p.metaOgDesc,
      'og:title, og:description, og:image all present',
      'Partial Open Graph — add missing tags',
      'No Open Graph tags found',
    ),
    check('canonical', 'Canonical URL', 7,
      p.canonical,
      false,
      'Canonical tag present',
      '',
      'Missing canonical tag',
    ),
    check('twitter', 'Twitter Card', 5,
      p.metaTwitterCard,
      false,
      'Twitter card meta present',
      '',
      'Missing twitter:card meta tag',
    ),
    check('favicon', 'Favicon', 3,
      p.favicon,
      false,
      'Favicon defined',
      '',
      'No favicon found',
    ),
  ]
  return { id: 'seo', label: 'SEO', checks, score: score(checks) }
}

function buildPerformance(p: ReturnType<typeof parseHTML>): Category {
  const checks: Check[] = [
    check('htmlsize', 'HTML File Size', 15,
      p.htmlSize < 200_000,
      p.htmlSize < 500_000,
      `${Math.round(p.htmlSize / 1024)}KB — excellent`,
      `${Math.round(p.htmlSize / 1024)}KB — consider reducing`,
      `${Math.round(p.htmlSize / 1024)}KB — too large, reduce below 500KB`,
    ),
    check('viewport', 'Viewport Meta', 12,
      p.metaViewport,
      false,
      'Viewport meta tag present',
      '',
      'Missing viewport meta tag — mobile will break',
    ),
    check('imgoptim', 'Image Optimisation', 10,
      p.imgLazy > 0 || p.imgTotal === 0,
      p.imgTotal > 0,
      p.imgTotal === 0 ? 'No images to check' : `${p.imgLazy} of ${p.imgTotal} images lazy loaded`,
      'No lazy loading detected — add loading="lazy" to images',
      'No lazy loading detected',
    ),
    check('webp', 'WebP Images', 8,
      p.imgWebP > 0 || p.imgTotal === 0,
      false,
      p.imgTotal === 0 ? 'No images to check' : `${p.imgWebP} WebP images found`,
      '',
      'No WebP images — consider converting for smaller file sizes',
    ),
    check('fontdisplay', 'Font Display Swap', 8,
      p.fontDisplay,
      false,
      'font-display: swap found — fonts won\'t block render',
      '',
      'Missing font-display: swap — fonts may block rendering',
    ),
    check('preload', 'Preload Hints', 7,
      p.hasPreload,
      false,
      'Resource preloading found',
      '',
      'No preload hints — consider preloading critical fonts or images',
    ),
    check('gsap', 'GSAP Animations', 10,
      p.gsapLoaded && p.scrollTrigger,
      p.gsapLoaded,
      `GSAP + ScrollTrigger active · ${p.animCount} animations`,
      'GSAP loaded but no ScrollTrigger found',
      'No GSAP animations detected',
    ),
    check('inlinestyles', 'Inline Styles', 8,
      p.inlineStyles < 5,
      p.inlineStyles < 20,
      'Minimal inline styles — clean separation',
      `${p.inlineStyles} inline styles — move to stylesheet`,
      `${p.inlineStyles} inline styles — move all to <style> tag`,
    ),
  ]
  return { id: 'performance', label: 'Performance', checks, score: score(checks) }
}

function buildAccessibility(p: ReturnType<typeof parseHTML>): Category {
  const checks: Check[] = [
    check('lang', 'HTML Lang Attribute', 15,
      p.langAttr,
      false,
      'lang attribute set on <html>',
      '',
      'Missing lang attribute on <html> tag',
    ),
    check('alttext_a11y', 'Alt Text (A11Y)', 15,
      p.imgTotal === 0 || p.imgMissingAlt === 0,
      p.imgMissingAlt <= 2,
      p.imgTotal === 0 ? 'No images to check' : 'All images have alt text',
      `${p.imgMissingAlt} images missing alt text`,
      `${p.imgMissingAlt} images missing alt text — screen readers cannot describe them`,
    ),
    check('aria', 'ARIA Labels', 12,
      p.ariaLabels >= 3,
      p.ariaLabels >= 1,
      `${p.ariaLabels} aria-label attributes found`,
      `Only ${p.ariaLabels} aria-label — add more for interactive elements`,
      'No ARIA labels found',
    ),
    check('roles', 'ARIA Roles', 10,
      p.ariaRoles >= 2,
      p.ariaRoles >= 1,
      `${p.ariaRoles} ARIA roles defined`,
      `${p.ariaRoles} ARIA role — add more for landmarks`,
      'No ARIA roles found',
    ),
    check('skip', 'Skip Navigation', 8,
      p.skipLink,
      false,
      'Skip navigation link found',
      '',
      'No skip navigation link — keyboard users cannot skip nav',
    ),
    check('labels', 'Form Labels', 10,
      p.inputs === 0 || p.inputLabels >= p.inputs,
      p.inputs === 0 || p.inputLabels > 0,
      p.inputs === 0 ? 'No forms to check' : `${p.inputLabels} labels for ${p.inputs} inputs`,
      `${p.inputLabels} labels for ${p.inputs} inputs — some inputs may be unlabelled`,
      `${p.inputs} inputs with no labels — all inputs need labels`,
    ),
    check('viewport_a11y', 'Viewport User Scale', 8,
      p.metaViewport && !/user-scalable=no/i.test(''),
      p.metaViewport,
      'Viewport allows user scaling',
      'Viewport present but check user-scalable is not disabled',
      'Missing viewport meta — zooming may be broken',
    ),
  ]
  return { id: 'accessibility', label: 'Accessibility', checks, score: score(checks) }
}

function buildDesign(p: ReturnType<typeof parseHTML>): Category {
  const checks: Check[] = [
    check('sections', 'Required Sections', 15,
      p.hasNav && p.hasHero && p.hasFooter,
      p.hasNav || p.hasHero || p.hasFooter,
      'Nav, Hero, and Footer all present',
      'Some key sections missing',
      'Missing nav, hero, or footer',
    ),
    check('testimonials', 'Testimonials', 12,
      p.hasTestimonials,
      false,
      'Testimonials section found',
      '',
      'No testimonials section — add social proof',
    ),
    check('about', 'About Section', 10,
      p.hasAbout,
      false,
      'About section found',
      '',
      'No about section — users want to know who you are',
    ),
    check('services', 'Services Section', 10,
      p.hasServices,
      false,
      'Services/offerings section found',
      '',
      'No services section — what do you offer?',
    ),
    check('themecolor', 'Theme Color', 8,
      p.metaThemeColor,
      false,
      'theme-color meta set — browser chrome matches brand',
      '',
      'Missing theme-color meta — add for mobile browser chrome',
    ),
    check('stylesheets', 'CSS in Style Tag', 8,
      p.styleTag && p.inlineStyles < 10,
      p.styleTag,
      'All CSS in <style> tag — clean architecture',
      'CSS in style tag but some inline styles present',
      'Styles scattered — consolidate into <style> tag',
    ),
    check('responsive', 'Responsive Design', 15,
      p.metaViewport && !/<table[^>]+width=["']\d+["']/i.test(''),
      p.metaViewport,
      'Viewport meta present — likely responsive',
      'Viewport set but check mobile layouts manually',
      'No viewport meta — not responsive',
    ),
  ]
  return { id: 'design', label: 'Design', checks, score: score(checks) }
}

function buildConversion(p: ReturnType<typeof parseHTML>): Category {
  const checks: Check[] = [
    check('cta', 'Call to Action', 20,
      p.ctaButtons >= 2,
      p.ctaButtons >= 1,
      `${p.ctaButtons} CTA buttons found — good coverage`,
      `${p.ctaButtons} CTA found — add more throughout the page`,
      'No CTA buttons detected',
    ),
    check('contact', 'Contact Options', 15,
      (p.hasPhone || p.hasEmail) && (p.hasForm || p.hasPhone),
      p.hasPhone || p.hasEmail || p.hasForm,
      `${[p.hasPhone && 'Phone', p.hasEmail && 'Email', p.hasForm && 'Form'].filter(Boolean).join(', ')} found`,
      'At least one contact method found — add more options',
      'No contact method found — add phone, email, or form',
    ),
    check('socialproof', 'Social Proof', 15,
      p.hasSocialProof,
      false,
      'Testimonials/reviews/trust signals found',
      '',
      'No social proof — add testimonials or client logos',
    ),
    check('pricing', 'Pricing Transparency', 12,
      p.hasPricing,
      false,
      'Pricing or price signals found',
      '',
      'No pricing info — consider showing rates or starting prices',
    ),
    check('faq', 'FAQ Section', 8,
      p.hasFAQ,
      false,
      'FAQ section found — objections addressed',
      '',
      'No FAQ — consider adding to address common questions',
    ),
    check('links', 'Internal Links', 10,
      p.linksTotal >= 5,
      p.linksTotal >= 2,
      `${p.linksTotal} links found — good navigation`,
      `${p.linksTotal} links — add more internal navigation`,
      'Very few links — add navigation and CTA links',
    ),
  ]
  return { id: 'conversion', label: 'Conversion', checks, score: score(checks) }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { html, projectId } = await req.json()

    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'html is required' }, { status: 400 })
    }

    const parsed     = parseHTML(html)
    const categories = [
      buildSEO(parsed),
      buildPerformance(parsed),
      buildAccessibility(parsed),
      buildDesign(parsed),
      buildConversion(parsed),
    ]

    // Overall = weighted average
    const weights: Record<string, number> = {
      seo:           30,
      performance:   25,
      accessibility: 20,
      design:        15,
      conversion:    10,
    }
    const totalWeight  = Object.values(weights).reduce((a, b) => a + b, 0)
    const weightedSum  = categories.reduce((a, c) => a + c.score * (weights[c.id] ?? 0), 0)
    const overall      = Math.round(weightedSum / totalWeight)

    const result: SiteIQResult = {
      overall,
      categories,
      generated: new Date().toISOString(),
    }

    // Optionally save to Supabase if projectId provided
    if (projectId) {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await sb.from('siteiq_reports').upsert({
        project_id: projectId,
        overall,
        categories: JSON.stringify(categories),
        created_at: new Date().toISOString(),
      }, { onConflict: 'project_id' })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('SiteIQ error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}