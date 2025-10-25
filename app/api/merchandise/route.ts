import { NextResponse } from 'next/server'

const MERCHANDISE_ARTWORK_IDS = [
  436535, 436532, 459055, 438817, 436105,
  435809, 436231, 437853, 459080, 438754,
  436524, 437329, 459052, 436947, 435568,
  436151, 437392, 438421, 11237, 437112
]

function generatePrice(id: number): number {
  const seed = id % 100
  const basePrice = 29.99
  const prices = [basePrice, 49.99, 79.99, 99.99, 149.99]
  return prices[seed % prices.length]
}

export async function GET() {
  try {
    const merchandise = await Promise.all(
      MERCHANDISE_ARTWORK_IDS.map(async (id) => {
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
            medium: data.medium || '',
            price: generatePrice(data.objectID)
          }
        } catch (error) {
          console.error(`Failed to fetch merchandise ${id}:`, error)
          return null
        }
      })
    )

    const validMerchandise = merchandise.filter(item => item !== null)

    return NextResponse.json(validMerchandise)
  } catch (error) {
    console.error('Error in merchandise API:', error)
    return NextResponse.json({ error: 'Failed to fetch merchandise' }, { status: 500 })
  }
}
