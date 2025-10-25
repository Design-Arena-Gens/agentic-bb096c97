import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Met Store - Museum & Merchandise',
  description: 'Explore world-class art and shop exclusive merchandise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
