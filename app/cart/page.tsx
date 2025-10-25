'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CartItem {
  objectID: number
  title: string
  artistDisplayName: string
  primaryImageSmall: string
  price: number
  quantity: number
}

interface OrderData {
  name: string
  email: string
  address: string
  city: string
  zip: string
  card: string
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState<OrderData>({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    card: ''
  })

  useEffect(() => {
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

  const removeFromCart = (objectID: number) => {
    saveCart(cart.filter(item => item.objectID !== objectID))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          total
        })
      })

      if (response.ok) {
        setOrderComplete(true)
        localStorage.removeItem('cart')
        setCart([])
      }
    } catch (error) {
      console.error('Order failed:', error)
      alert('Order failed. Please try again.')
    }
  }

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

      <main className="container">
        <h1 className="section-title">Shopping Cart</h1>

        {orderComplete ? (
          <div className="success-message">
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase. Your order has been received.</p>
            <Link href="/merch">
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <Link href="/merch">
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Merchandise
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.objectID} className="cart-item">
                  <img
                    src={item.primaryImageSmall}
                    alt={item.title}
                    className="cart-item-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23f5f5f5" width="120" height="120"/%3E%3C/svg%3E'
                    }}
                  />
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="card-artist">{item.artistDisplayName}</p>
                    <p className="cart-item-price">${item.price.toFixed(2)} × {item.quantity}</p>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.objectID)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <div className="cart-total-amount">Total: ${total.toFixed(2)}</div>
              {!showCheckout ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              ) : null}
            </div>

            {showCheckout && (
              <form className="checkout-form" onSubmit={handleCheckout}>
                <h2 className="section-title">Checkout Information</h2>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Credit Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={formData.card}
                    onChange={(e) => setFormData({...formData, card: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Complete Order - ${total.toFixed(2)}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  )
}
