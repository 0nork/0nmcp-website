import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'Google Places API not configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.rating,places.userRatingCount,places.regularOpeningHours',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en',
        maxResultCount: 5,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Google Places API error:', err)
      return NextResponse.json({ results: [] })
    }

    const data = await res.json()
    const results = (data.places || []).map((place: Record<string, unknown>) => ({
      placeId: place.id,
      name: (place.displayName as Record<string, string>)?.text || '',
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      types: place.types || [],
      rating: place.rating,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Places search error:', err)
    return NextResponse.json({ results: [] })
  }
}
