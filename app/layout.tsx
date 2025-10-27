import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hospital Management System',
  description: 'Simple appointment booking system for hospitals',
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
