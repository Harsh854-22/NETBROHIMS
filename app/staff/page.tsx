'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icons } from '@/components/Icons'
import RoomsView from '@/components/staff/RoomsView'
import BedsView from '@/components/staff/BedsView'
import AppointmentsView from '@/components/staff/AppointmentsView'
import PatientsView from '@/components/staff/PatientsView'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist' | 'staff'
  phone?: string
}

export default function StaffPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'rooms' | 'beds' | 'appointments' | 'patients'>('rooms')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'staff') {
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
              <Icons.clipboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Staff Dashboard</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">Room & Patient Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Staff Member</p>
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
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'rooms'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.building className="w-4 h-4" />
              <span>Rooms</span>
            </button>
            <button
              onClick={() => setActiveTab('beds')}
              className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'beds'
                  ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <Icons.bed className="w-4 h-4" />
              <span>Beds</span>
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
              <span>Appointments</span>
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
              <span>Patients</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8 mb-12">
          {activeTab === 'rooms' && <RoomsView />}
          {activeTab === 'beds' && <BedsView />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'patients' && <PatientsView />}
        </div>
      </div>
    </div>
  )
}
