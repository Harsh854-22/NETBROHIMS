'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icons } from '@/components/Icons'
import DashboardView from '@/components/admin/DashboardView'
import DoctorsView from '@/components/admin/DoctorsView'
import PatientsView from '@/components/admin/PatientsView'
import AppointmentsView from '@/components/admin/AppointmentsView'
import PharmacistsView from '@/components/admin/PharmacistsView'
import SettingsView from '@/components/admin/SettingsView'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'patients' | 'appointments' | 'pharmacists' | 'settings'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-[var(--primary)] border-r-transparent opacity-75"></div>
          <p className="mt-4 text-[var(--muted-foreground)] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[var(--gradient-to)] via-[var(--gradient-via)] to-[var(--gradient-from)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-[var(--card)] border-b-2 border-[var(--border)] shadow-lg relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] shadow-lg">
              <Icons.shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">Hospital Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
            >
              <Icons.logout className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl shadow-lg p-2">
          <nav className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.chart className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'patients'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.users className="w-4 h-4" />
              <span className="hidden sm:inline">Patients</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Appointments</span>
            </button>
            <button
              onClick={() => setActiveTab('pharmacists')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'pharmacists'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.pill className="w-4 h-4" />
              <span className="hidden sm:inline">Pharmacists</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8 mb-12">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'doctors' && <DoctorsView currentUserId={currentUser?.id || ''} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'patients' && <PatientsView currentUserId={currentUser?.id || ''} />}
          {activeTab === 'appointments' && <AppointmentsView searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'pharmacists' && <PharmacistsView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  )
}
