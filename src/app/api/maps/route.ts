import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    // Use the server-side API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    // Return the iframe HTML content
    return NextResponse.json({
      embedUrl: `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`
    })
  } catch (error) {
    console.error('Maps API error:', error)
    return NextResponse.json({ error: 'Failed to process maps request' }, { status: 500 })
  }
} 