import { NextResponse } from 'next/server'

interface Order {
  id: string
  customer: {
    name: string
    email: string
    address: string
    city: string
    zip: string
  }
  items: Array<{
    objectID: number
    title: string
    price: number
    quantity: number
  }>
  total: number
  timestamp: string
  status: string
}

let orders: Order[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        address: body.customer.address,
        city: body.customer.city,
        zip: body.customer.zip
      },
      items: body.items.map((item: any) => ({
        objectID: item.objectID,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      total: body.total,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    }

    orders.push(order)

    console.log('New order created:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order placed successfully'
    })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({
      error: 'Failed to process order'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    orders: orders.map(order => ({
      id: order.id,
      total: order.total,
      timestamp: order.timestamp,
      status: order.status,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }))
  })
}
