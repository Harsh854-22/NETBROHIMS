import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { UISettingsProvider } from '@/contexts/UISettingsContext'

export const metadata: Metadata = {
  title: 'Hospital Management System',
  description: 'Modern appointment booking system for hospitals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <UISettingsProvider>
            {children}
          </UISettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
