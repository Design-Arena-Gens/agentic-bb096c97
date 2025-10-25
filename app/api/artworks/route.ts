import { NextResponse } from 'next/server'

const FEATURED_ARTWORK_IDS = [
  436535, 436532, 459055, 438817, 436105,
  435809, 436231, 437853, 459080, 438754,
  436524, 436535, 437329, 459052, 436947,
  11237, 435568, 436151, 437392, 438421
]

export async function GET() {
  try {
    const artworks = await Promise.all(
      FEATURED_ARTWORK_IDS.map(async (id) => {
        try {
          const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
          if (!response.ok) return null
          const data = await response.json()

          if (!data.primaryImageSmall) return null

          return {
            objectID: data.objectID,
            title: data.title || 'Untitled',
            artistDisplayName: data.artistDisplayName || 'Unknown Artist',
            primaryImage: data.primaryImage || '',
            primaryImageSmall: data.primaryImageSmall || '',
            objectDate: data.objectDate || 'Date Unknown',
            department: data.department || '',
            culture: data.culture || '',
            medium: data.medium || ''
          }
        } catch (error) {
          console.error(`Failed to fetch artwork ${id}:`, error)
          return null
        }
      })
    )

    const validArtworks = artworks.filter(art => art !== null)

    return NextResponse.json(validArtworks)
  } catch (error) {
    console.error('Error in artworks API:', error)
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 })
  }
}
