'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

type PrescriptionQueue = {
  id: string
  prescription: string
  doctor_notes?: string
  status: string
  created_at: string
  dispensed_at?: string
  patients?: {
    users?: {
      name: string
      phone?: string
    }
  }
  doctors?: {
    users?: {
      name: string
    }
    specialization?: string
  }
  appointments?: {
    appointment_date: string
    appointment_time: string
  }
}

export default function PharmacistPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [pharmacistId, setPharmacistId] = useState<string>('')
  const [pharmacyShopId, setPharmacyShopId] = useState<string>('')
  const [prescriptions, setPrescriptions] = useState<PrescriptionQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'dispensed'>('pending')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (pharmacyShopId) {
      loadPrescriptions()
    }
  }, [pharmacyShopId, filter])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'pharmacist') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Get pharmacist profile
    const { data: pharmacist } = await supabase
      .from('pharmacists')
      .select('id, pharmacy_shop_id')
      .eq('user_id', user.id)
      .single()
    
    if (pharmacist) {
      setPharmacistId(pharmacist.id)
      setPharmacyShopId(pharmacist.pharmacy_shop_id)
    }
    setLoading(false)
  }

  const loadPrescriptions = async () => {
    let query = supabase
      .from('prescription_queue')
      .select(`
        *,
        patients (
          id,
          users:user_id (name, phone)
        ),
        doctors (
          id,
          users:user_id (name),
          specialization
        ),
        appointments (
          appointment_date,
          appointment_time
        )
      `)
      .eq('pharmacy_shop_id', pharmacyShopId)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setPrescriptions(data)
    }
  }

  const markAsDispensed = async (prescriptionId: string) => {
    const { error } = await supabase
      .from('prescription_queue')
      .update({
        status: 'dispensed',
        dispensed_at: new Date().toISOString()
      })
      .eq('id', prescriptionId)

    if (error) {
      alert('Error updating prescription status')
      return
    }

    alert('Prescription marked as dispensed!')
    loadPrescriptions()
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

  if (!pharmacyShopId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center bg-[var(--card)] border-2 border-[var(--border)] p-10 rounded-2xl shadow-xl max-w-md animate-scaleIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-bold text-lg mb-2">Not Assigned!</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">You are not assigned to any pharmacy shop. Please contact the administrator.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            Logout
          </button>
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] shadow-md hover-lift">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)] bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent">Pharmacist Dashboard</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Manage prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Pharmacist</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-sm shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8 relative z-10">
        <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm animate-fadeIn hover-lift">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent">Prescription Queue</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('dispensed')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'dispensed' 
                    ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Dispensed
              </button>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--muted)] mb-4">
                <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[var(--muted-foreground)] font-medium">No prescriptions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className={`border-2 rounded-lg p-4 ${
                    rx.status === 'pending'
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-bold">{rx.patients?.users?.name}</h3>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                            rx.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {rx.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-gray-700">
                            📞 <span className="font-semibold">Phone:</span> {rx.patients?.users?.phone || 'N/A'}
                          </p>
                          <p className="text-gray-700">
                            👨‍⚕️ <span className="font-semibold">Doctor:</span> {rx.doctors?.users?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700">
                            🏥 <span className="font-semibold">Specialization:</span> {rx.doctors?.specialization || 'N/A'}
                          </p>
                          <p className="text-gray-700">
                            📅 <span className="font-semibold">Received:</span> {new Date(rx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border mb-2">
                        <p className="font-bold text-sm mb-2" style={{ color: '#006989' }}>
                          💊 Prescription:
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{rx.prescription}</p>
                      </div>

                      {rx.doctor_notes && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="font-bold text-sm mb-1 text-blue-700">📋 Doctor&apos;s Notes:</p>
                          <p className="text-xs whitespace-pre-wrap text-gray-700">{rx.doctor_notes}</p>
                        </div>
                      )}

                      {rx.dispensed_at && (
                        <p className="mt-2 text-xs text-green-600">
                          ✓ Dispensed on: {new Date(rx.dispensed_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {rx.status === 'pending' && (
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => markAsDispensed(rx.id)}
                          className="px-3 py-1.5 text-white rounded hover:bg-opacity-90 text-xs font-medium whitespace-nowrap"
                          style={{ backgroundColor: '#006989' }}
                        >
                          ✓ Mark Dispensed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
