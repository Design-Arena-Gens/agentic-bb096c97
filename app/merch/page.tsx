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
  price: number
}

interface CartItem extends Artwork {
  quantity: number
}

export default function Merch() {
  const [merchandise, setMerchandise] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMerchandise()
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

  const fetchMerchandise = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/merchandise')
      const data = await response.json()
      setMerchandise(data)
    } catch (error) {
      console.error('Error fetching merchandise:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: Artwork) => {
    const existing = cart.find(cartItem => cartItem.objectID === item.objectID)
    if (existing) {
      saveCart(cart.map(cartItem =>
        cartItem.objectID === item.objectID
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      saveCart([...cart, { ...item, quantity: 1 }])
    }
    setSelectedItem(null)
  }

  const filteredMerch = merchandise.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artistDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">THE MET</Link>
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
        <h1>Museum Store</h1>
        <p>Own museum-quality prints and reproductions of masterpieces</p>
      </section>

      <main className="container">
        <h2 className="section-title">Shop Merchandise</h2>

        <input
          type="text"
          className="search-bar"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="loading">Loading merchandise...</div>
        ) : (
          <div className="grid">
            {filteredMerch.map((item) => (
              <div
                key={item.objectID}
                className="card"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.primaryImageSmall || '/placeholder.jpg'}
                  alt={item.title}
                  className="card-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="250"%3E%3Crect fill="%23f5f5f5" width="280" height="250"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />
                <div className="card-content">
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-artist">{item.artistDisplayName || 'Unknown Artist'}</p>
                  <div className="card-price">${item.price.toFixed(2)}</div>
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(item)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
            <img
              src={selectedItem.primaryImage || selectedItem.primaryImageSmall}
              alt={selectedItem.title}
              className="modal-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f5f5f5" width="800" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image Available%3C/text%3E%3C/svg%3E'
              }}
            />
            <div className="modal-content">
              <h2 className="modal-title">{selectedItem.title}</h2>
              <p className="modal-info"><strong>Artist:</strong> {selectedItem.artistDisplayName || 'Unknown'}</p>
              <p className="modal-info"><strong>Date:</strong> {selectedItem.objectDate}</p>
              <p className="modal-info"><strong>Medium:</strong> {selectedItem.medium || 'N/A'}</p>
              <div className="card-price">${selectedItem.price.toFixed(2)}</div>
              <button className="btn btn-primary" onClick={() => addToCart(selectedItem)}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
