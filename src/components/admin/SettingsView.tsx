'use client'

import { useState } from 'react'
import { useUISettings } from '@/contexts/UISettingsContext'
import { Icons } from '@/components/Icons'

export default function SettingsView() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useUISettings()
  const [activeTab, setActiveTab] = useState<'buttons' | 'cards' | 'text' | 'logo' | 'theme' | 'spacing'>('buttons')
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExport = () => {
    const exported = exportSettings()
    navigator.clipboard.writeText(exported)
    showMessage('success', 'Settings copied to clipboard!')
  }

  const handleImport = () => {
    try {
      importSettings(importText)
      showMessage('success', 'Settings imported successfully!')
      setShowImport(false)
      setImportText('')
    } catch (error) {
      showMessage('error', 'Invalid settings format')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings()
      showMessage('success', 'Settings reset to default')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">UI Settings</h2>
          <p className="text-[var(--muted-foreground)] mt-1">Customize the look and feel of your dashboard</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 bg-[var(--card)] border-2 border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--accent)] transition-all font-semibold text-sm flex items-center gap-2"
          >
            <Icons.upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[var(--card)] border-2 border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--accent)] transition-all font-semibold text-sm flex items-center gap-2"
          >
            <Icons.download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold text-sm flex items-center gap-2"
          >
            <Icons.refresh className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="bg-[var(--card)] border-2 border-[var(--border)] p-6 rounded-xl">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Import Settings</h3>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-32 p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)] font-mono text-sm"
            placeholder="Paste your settings JSON here..."
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Import
            </button>
            <button
              onClick={() => setShowImport(false)}
              className="px-4 py-2 bg-[var(--card)] border-2 border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--accent)] transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-2">
        <nav className="flex gap-2 overflow-x-auto">
          {(['buttons', 'cards', 'text', 'logo', 'theme', 'spacing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6">
        {/* Button Settings */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Button Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Size Preset</label>
                <select
                  value={settings.button.size}
                  onChange={(e) => {
                    const size = e.target.value as 'sm' | 'md' | 'lg' | 'xl'
                    const presets = {
                      sm: { fontSize: '12px', paddingX: '12px', paddingY: '6px' },
                      md: { fontSize: '14px', paddingX: '16px', paddingY: '10px' },
                      lg: { fontSize: '16px', paddingX: '20px', paddingY: '12px' },
                      xl: { fontSize: '18px', paddingX: '24px', paddingY: '14px' },
                    }
                    updateSettings({ button: { ...settings.button, size, ...presets[size] } })
                  }}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Font Size</label>
                <input
                  type="text"
                  value={settings.button.fontSize}
                  onChange={(e) => updateSettings({ button: { ...settings.button, fontSize: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="14px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Font Weight</label>
                <select
                  value={settings.button.fontWeight}
                  onChange={(e) => updateSettings({ button: { ...settings.button, fontWeight: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Border Radius</label>
                <input
                  type="text"
                  value={settings.button.borderRadius}
                  onChange={(e) => updateSettings({ button: { ...settings.button, borderRadius: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="8px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Horizontal Padding</label>
                <input
                  type="text"
                  value={settings.button.paddingX}
                  onChange={(e) => updateSettings({ button: { ...settings.button, paddingX: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="16px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Vertical Padding</label>
                <input
                  type="text"
                  value={settings.button.paddingY}
                  onChange={(e) => updateSettings({ button: { ...settings.button, paddingY: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="10px"
                />
              </div>
            </div>

            {/* Button Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <button
                style={{
                  fontSize: settings.button.fontSize,
                  fontWeight: settings.button.fontWeight,
                  borderRadius: settings.button.borderRadius,
                  paddingLeft: settings.button.paddingX,
                  paddingRight: settings.button.paddingX,
                  paddingTop: settings.button.paddingY,
                  paddingBottom: settings.button.paddingY,
                }}
                className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white shadow-md hover:shadow-lg transition-all"
              >
                Sample Button
              </button>
            </div>
          </div>
        )}

        {/* Card Settings */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Card Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Border Radius</label>
                <input
                  type="text"
                  value={settings.card.borderRadius}
                  onChange={(e) => updateSettings({ card: { ...settings.card, borderRadius: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="12px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Border Width</label>
                <input
                  type="text"
                  value={settings.card.borderWidth}
                  onChange={(e) => updateSettings({ card: { ...settings.card, borderWidth: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="2px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Padding</label>
                <input
                  type="text"
                  value={settings.card.padding}
                  onChange={(e) => updateSettings({ card: { ...settings.card, padding: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="24px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Shadow Size</label>
                <select
                  value={settings.card.shadowSize}
                  onChange={(e) => updateSettings({ card: { ...settings.card, shadowSize: e.target.value as 'none' | 'sm' | 'md' | 'lg' | 'xl' } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            </div>

            {/* Card Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <div
                style={{
                  borderRadius: settings.card.borderRadius,
                  borderWidth: settings.card.borderWidth,
                  padding: settings.card.padding,
                  boxShadow: settings.card.shadowSize !== 'none' ? `var(--card-shadow)` : 'none',
                }}
                className="bg-[var(--card)] border-[var(--border)]"
              >
                <h4 className="font-bold text-[var(--foreground)] mb-2">Sample Card</h4>
                <p className="text-[var(--muted-foreground)]">This is how your cards will look with the current settings.</p>
              </div>
            </div>
          </div>
        )}

        {/* Text Settings */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Text Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Heading Font Size</label>
                <input
                  type="text"
                  value={settings.text.headingFontSize}
                  onChange={(e) => updateSettings({ text: { ...settings.text, headingFontSize: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="24px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Body Font Size</label>
                <input
                  type="text"
                  value={settings.text.bodyFontSize}
                  onChange={(e) => updateSettings({ text: { ...settings.text, bodyFontSize: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="14px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Small Font Size</label>
                <input
                  type="text"
                  value={settings.text.smallFontSize}
                  onChange={(e) => updateSettings({ text: { ...settings.text, smallFontSize: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="12px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Heading Font Weight</label>
                <select
                  value={settings.text.headingFontWeight}
                  onChange={(e) => updateSettings({ text: { ...settings.text, headingFontWeight: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Body Font Weight</label>
                <select
                  value={settings.text.bodyFontWeight}
                  onChange={(e) => updateSettings({ text: { ...settings.text, bodyFontWeight: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                </select>
              </div>
            </div>

            {/* Text Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg space-y-3">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <h4 style={{ fontSize: settings.text.headingFontSize, fontWeight: settings.text.headingFontWeight }} className="text-[var(--foreground)]">
                Sample Heading Text
              </h4>
              <p style={{ fontSize: settings.text.bodyFontSize, fontWeight: settings.text.bodyFontWeight }} className="text-[var(--foreground)]">
                Sample body text that shows how your paragraphs will look.
              </p>
              <p style={{ fontSize: settings.text.smallFontSize }} className="text-[var(--muted-foreground)]">
                Sample small text for labels and captions
              </p>
            </div>
          </div>
        )}

        {/* Logo Settings */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Logo Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Logo Text</label>
                <input
                  type="text"
                  value={settings.logo.text}
                  onChange={(e) => updateSettings({ logo: { ...settings.logo, text: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="HIMS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Logo Size</label>
                <input
                  type="text"
                  value={settings.logo.size}
                  onChange={(e) => updateSettings({ logo: { ...settings.logo, size: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="56px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Icon Size</label>
                <input
                  type="text"
                  value={settings.logo.iconSize}
                  onChange={(e) => updateSettings({ logo: { ...settings.logo, iconSize: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="28px"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.logo.showIcon}
                  onChange={(e) => updateSettings({ logo: { ...settings.logo, showIcon: e.target.checked } })}
                  className="w-5 h-5"
                  id="showIcon"
                />
                <label htmlFor="showIcon" className="text-sm font-semibold text-[var(--foreground)]">Show Icon</label>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <div className="flex items-center gap-4">
                {settings.logo.showIcon && (
                  <div
                    style={{ width: settings.logo.size, height: settings.logo.size }}
                    className="rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-lg"
                  >
                    <Icons.shield style={{ width: settings.logo.iconSize, height: settings.logo.iconSize }} className="text-white" />
                  </div>
                )}
                <span className="text-2xl font-bold text-[var(--foreground)]">{settings.logo.text}</span>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Theme Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Theme Mode</label>
                <select
                  value={settings.theme.mode}
                  onChange={(e) => updateSettings({ theme: { ...settings.theme, mode: e.target.value as 'light' | 'dark' | 'system' } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateSettings({ theme: { ...settings.theme, primaryColor: e.target.value } })}
                    className="w-16 h-12 rounded-lg border-2 border-[var(--border)]"
                  />
                  <input
                    type="text"
                    value={settings.theme.primaryColor}
                    onChange={(e) => updateSettings({ theme: { ...settings.theme, primaryColor: e.target.value } })}
                    className="flex-1 p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.theme.accentColor}
                    onChange={(e) => updateSettings({ theme: { ...settings.theme, accentColor: e.target.value } })}
                    className="w-16 h-12 rounded-lg border-2 border-[var(--border)]"
                  />
                  <input
                    type="text"
                    value={settings.theme.accentColor}
                    onChange={(e) => updateSettings({ theme: { ...settings.theme, accentColor: e.target.value } })}
                    className="flex-1 p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <div className="flex gap-4">
                <div style={{ backgroundColor: settings.theme.primaryColor }} className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-white font-semibold">Primary</span>
                </div>
                <div style={{ backgroundColor: settings.theme.accentColor }} className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-white font-semibold">Accent</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacing Settings */}
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Spacing Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Container Padding</label>
                <input
                  type="text"
                  value={settings.spacing.containerPadding}
                  onChange={(e) => updateSettings({ spacing: { ...settings.spacing, containerPadding: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="32px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Section Gap</label>
                <input
                  type="text"
                  value={settings.spacing.sectionGap}
                  onChange={(e) => updateSettings({ spacing: { ...settings.spacing, sectionGap: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="32px"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Element Gap</label>
                <input
                  type="text"
                  value={settings.spacing.elementGap}
                  onChange={(e) => updateSettings({ spacing: { ...settings.spacing, elementGap: e.target.value } })}
                  className="w-full p-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  placeholder="16px"
                />
              </div>
            </div>

            {/* Spacing Preview */}
            <div className="mt-8 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-4">Preview:</p>
              <div style={{ padding: settings.spacing.containerPadding }} className="bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div style={{ gap: settings.spacing.sectionGap }} className="flex flex-col">
                  <div className="bg-blue-200 dark:bg-blue-800/50 p-4 rounded">Section 1</div>
                  <div className="bg-blue-200 dark:bg-blue-800/50 p-4 rounded">
                    <div style={{ gap: settings.spacing.elementGap }} className="flex flex-col">
                      <div className="bg-blue-300 dark:bg-blue-700/50 p-2 rounded text-sm">Element 1</div>
                      <div className="bg-blue-300 dark:bg-blue-700/50 p-2 rounded text-sm">Element 2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
