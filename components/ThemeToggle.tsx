'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-all duration-300 hover:bg-[var(--accent)] hover:scale-110 hover:shadow-lg active:scale-95 group"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun icon (light mode) */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-500 ${
          theme === 'light' 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>

      {/* Moon icon (dark mode) */}
      <svg
        className={`absolute h-5 w-5 transition-all duration-500 ${
          theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* Animated ring effect */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
    </button>
  )
}


