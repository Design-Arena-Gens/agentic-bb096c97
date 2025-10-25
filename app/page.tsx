'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Artwork {
  objectID: number
  title: string
  artistDisplayName: string
  primaryImage: string
  primaryImageSmall: string
  objectDate: string
  department: string
  culture: string
  medium: string
  price?: number
}

interface CartItem extends Artwork {
  quantity: number
}

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'art' | 'merch'>('art')

  useEffect(() => {
    fetchArtworks()
    loadCart()
  }, [])

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCart(JSON.parse(saved))
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artworks')
      const data = await response.json()
      setArtworks(data)
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (artwork: Artwork) => {
    const existing = cart.find(item => item.objectID === artwork.objectID)
    if (existing) {
      saveCart(cart.map(item =>
        item.objectID === artwork.objectID
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      saveCart([...cart, { ...artwork, quantity: 1 }])
    }
    setSelectedArt(null)
  }

  const filteredArtworks = artworks.filter(art =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.artistDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo">THE MET</div>
          <nav className="nav">
            <Link href="/">Collection</Link>
            <Link href="/merch">Shop</Link>
            <Link href="/cart">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>Discover World-Class Art</h1>
        <p>Explore masterpieces from The Metropolitan Museum of Art and bring them home</p>
      </section>

      <main className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'art' ? 'active' : ''}`}
            onClick={() => setActiveTab('art')}
          >
            Browse Collection
          </button>
          <button
            className={`tab ${activeTab === 'merch' ? 'active' : ''}`}
            onClick={() => setActiveTab('merch')}
          >
            Shop Merchandise
          </button>
        </div>

        <input
          type="text"
          className="search-bar"
          placeholder="Search artworks, artists, periods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="loading">Loading collection...</div>
        ) : (
          <div className="grid">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.objectID}
                className="card"
                onClick={() => setSelectedArt(artwork)}
              >
                <img
                  src={artwork.primaryImageSmall || '/placeholder.jpg'}
                  alt={artwork.title}
                  className="card-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="250"%3E%3Crect fill="%23f5f5f5" width="280" height="250"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />
                <div className="card-content">
                  <h3 className="card-title">{artwork.title}</h3>
                  <p className="card-artist">{artwork.artistDisplayName || 'Unknown Artist'}</p>
                  <p className="card-artist">{artwork.objectDate}</p>
                  {activeTab === 'merch' && (
                    <div className="card-price">${artwork.price?.toFixed(2)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedArt && (
        <div className="modal-overlay" onClick={() => setSelectedArt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArt(null)}>×</button>
            <img
              src={selectedArt.primaryImage || selectedArt.primaryImageSmall}
              alt={selectedArt.title}
              className="modal-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f5f5f5" width="800" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image Available%3C/text%3E%3C/svg%3E'
              }}
            />
            <div className="modal-content">
              <h2 className="modal-title">{selectedArt.title}</h2>
              <p className="modal-info"><strong>Artist:</strong> {selectedArt.artistDisplayName || 'Unknown'}</p>
              <p className="modal-info"><strong>Date:</strong> {selectedArt.objectDate}</p>
              <p className="modal-info"><strong>Culture:</strong> {selectedArt.culture || 'N/A'}</p>
              <p className="modal-info"><strong>Medium:</strong> {selectedArt.medium || 'N/A'}</p>
              <p className="modal-info"><strong>Department:</strong> {selectedArt.department}</p>
              {activeTab === 'merch' && (
                <>
                  <div className="card-price">${selectedArt.price?.toFixed(2)}</div>
                  <button className="btn btn-primary" onClick={() => addToCart(selectedArt)}>
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
