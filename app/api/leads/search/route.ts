import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')?.trim()
  const city = searchParams.get('city')?.trim()

  if (!type || !city) {
    return NextResponse.json({ error: 'type and city are required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  try {
    const query = encodeURIComponent(`${type} in ${city}`)
    const url   = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`

    const res  = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 502 })
    }

    const places = data.results ?? []

    const leads = await Promise.all(
      places.map(async (place: any) => {
        let has_website = false
        let phone       = ''
        let reviews: { author: string; rating: number; text: string; time: number }[] = []

        try {
          // Fetch website, phone AND reviews in one details call
          const detailUrl  = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number,reviews&key=${apiKey}`
          const detailRes  = await fetch(detailUrl)
          const detailData = await detailRes.json()
          const result     = detailData.result ?? {}

          has_website = !!result.website
          phone       = result.formatted_phone_number ?? ''

          // Google returns up to 5 reviews sorted by relevance
          // We keep max 5, filter out blanks
          reviews = (result.reviews ?? [])
            .filter((r: any) => r.text?.trim())
            .slice(0, 5)
            .map((r: any) => ({
              author: r.author_name ?? 'Customer',
              rating: r.rating      ?? 5,
              text:   r.text.trim(),
              time:   r.time        ?? 0,
            }))
        } catch {
          // silently skip detail failures
        }

        return {
          place_id:        place.place_id,
          business_name:   place.name,
          category:        (place.types?.[0] ?? '').replace(/_/g, ' '),
          address:         place.formatted_address ?? '',
          city,
          phone,
          rating:          place.rating             ?? null,
          review_count:    place.user_ratings_total ?? null,
          google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          has_website,
          lead_status:     'new',
          reviews,           // ← real Google reviews array
        }
      })
    )

    // Sort: no website first
    leads.sort((a, b) => Number(a.has_website) - Number(b.has_website))

    return NextResponse.json({ leads })
  } catch (err) {
    console.error('Lead search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}