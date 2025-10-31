'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UISettings = {
  // Button Settings
  button: {
    size: 'sm' | 'md' | 'lg' | 'xl'
    fontSize: string
    fontWeight: string
    borderRadius: string
    paddingX: string
    paddingY: string
  }
  // Card Settings
  card: {
    borderRadius: string
    borderWidth: string
    padding: string
    shadowSize: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }
  // Text Settings
  text: {
    headingFontSize: string
    bodyFontSize: string
    smallFontSize: string
    headingFontWeight: string
    bodyFontWeight: string
  }
  // Logo Settings
  logo: {
    size: string
    text: string
    showIcon: boolean
    iconSize: string
  }
  // Theme
  theme: {
    mode: 'light' | 'dark' | 'system'
    primaryColor: string
    accentColor: string
  }
  // Spacing
  spacing: {
    containerPadding: string
    sectionGap: string
    elementGap: string
  }
}

const defaultSettings: UISettings = {
  button: {
    size: 'md',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    paddingX: '16px',
    paddingY: '10px',
  },
  card: {
    borderRadius: '12px',
    borderWidth: '2px',
    padding: '24px',
    shadowSize: 'lg',
  },
  text: {
    headingFontSize: '24px',
    bodyFontSize: '14px',
    smallFontSize: '12px',
    headingFontWeight: '700',
    bodyFontWeight: '400',
  },
  logo: {
    size: '56px',
    text: 'HIMS',
    showIcon: true,
    iconSize: '28px',
  },
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
  },
  spacing: {
    containerPadding: '32px',
    sectionGap: '32px',
    elementGap: '16px',
  },
}

type UISettingsContextType = {
  settings: UISettings
  updateSettings: (newSettings: Partial<UISettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => void
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined)

export function UISettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UISettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('uiSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to load UI settings:', e)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uiSettings', JSON.stringify(settings))
    applySettingsToDOM(settings)
  }, [settings])

  const updateSettings = (newSettings: Partial<UISettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      button: { ...prev.button, ...(newSettings.button || {}) },
      card: { ...prev.card, ...(newSettings.card || {}) },
      text: { ...prev.text, ...(newSettings.text || {}) },
      logo: { ...prev.logo, ...(newSettings.logo || {}) },
      theme: { ...prev.theme, ...(newSettings.theme || {}) },
      spacing: { ...prev.spacing, ...(newSettings.spacing || {}) },
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2)
  }

  const importSettings = (settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson)
      setSettings(imported)
    } catch (e) {
      console.error('Failed to import settings:', e)
      throw new Error('Invalid settings format')
    }
  }

  return (
    <UISettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, exportSettings, importSettings }}
    >
      {children}
    </UISettingsContext.Provider>
  )
}

export function useUISettings() {
  const context = useContext(UISettingsContext)
  if (!context) {
    throw new Error('useUISettings must be used within UISettingsProvider')
  }
  return context
}

// Apply settings to DOM using CSS custom properties
function applySettingsToDOM(settings: UISettings) {
  const root = document.documentElement

  // Button settings
  root.style.setProperty('--btn-font-size', settings.button.fontSize)
  root.style.setProperty('--btn-font-weight', settings.button.fontWeight)
  root.style.setProperty('--btn-border-radius', settings.button.borderRadius)
  root.style.setProperty('--btn-padding-x', settings.button.paddingX)
  root.style.setProperty('--btn-padding-y', settings.button.paddingY)

  // Card settings
  root.style.setProperty('--card-border-radius', settings.card.borderRadius)
  root.style.setProperty('--card-border-width', settings.card.borderWidth)
  root.style.setProperty('--card-padding', settings.card.padding)
  
  const shadowSizes = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  }
  root.style.setProperty('--card-shadow', shadowSizes[settings.card.shadowSize])

  // Text settings
  root.style.setProperty('--heading-font-size', settings.text.headingFontSize)
  root.style.setProperty('--body-font-size', settings.text.bodyFontSize)
  root.style.setProperty('--small-font-size', settings.text.smallFontSize)
  root.style.setProperty('--heading-font-weight', settings.text.headingFontWeight)
  root.style.setProperty('--body-font-weight', settings.text.bodyFontWeight)

  // Logo settings
  root.style.setProperty('--logo-size', settings.logo.size)
  root.style.setProperty('--logo-icon-size', settings.logo.iconSize)

  // Spacing settings
  root.style.setProperty('--container-padding', settings.spacing.containerPadding)
  root.style.setProperty('--section-gap', settings.spacing.sectionGap)
  root.style.setProperty('--element-gap', settings.spacing.elementGap)

  // Theme colors
  root.style.setProperty('--custom-primary', settings.theme.primaryColor)
  root.style.setProperty('--custom-accent', settings.theme.accentColor)
}
