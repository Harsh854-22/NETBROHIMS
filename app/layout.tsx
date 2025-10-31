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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <ThemeProvider>
          <UISettingsProvider>
            {children}
          </UISettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
