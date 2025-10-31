'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icons } from '@/components/Icons'

type User = {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'doctor' | 'patient' | 'pharmacist' | 'staff'
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
        <div className="text-center bg-[var(--card)] border-2 border-[var(--border)] p-10 rounded-2xl shadow-xl max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <Icons.warning className="w-10 h-10 text-red-600" />
          </div>
          <p className="text-red-600 font-bold text-xl mb-2">Not Assigned!</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">You are not assigned to any pharmacy shop. Please contact the administrator.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold mx-auto"
          >
            <Icons.logout className="w-4 h-4" />
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
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Icons.pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Pharmacist Dashboard</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">Manage prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Pharmacist</p>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12 relative z-10">
        <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Icons.pill className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Prescription Queue</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('dispensed')}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                  filter === 'dispensed' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                    : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Dispensed
              </button>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--muted)] mb-4">
                <Icons.prescription className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-[var(--muted-foreground)] font-medium text-lg">No prescriptions found</p>
              <p className="text-[var(--muted-foreground)] text-sm mt-2">Prescription queue will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-md ${
                    rx.status === 'pending'
                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
                      : 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
                          <Icons.user className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[var(--foreground)]">{rx.patients?.users?.name}</h3>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase ${
                              rx.status === 'pending'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {rx.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                            <Icons.phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="font-semibold">Phone:</span>
                            <span>{rx.patients?.users?.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                            <Icons.stethoscope className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="font-semibold">Doctor:</span>
                            <span>{rx.doctors?.users?.name}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                            <Icons.hospital className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="font-semibold">Spec:</span>
                            <span>{rx.doctors?.specialization || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                            <Icons.calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="font-semibold">Received:</span>
                            <span>{new Date(rx.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[var(--card)] rounded-lg border-2 border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-3">
                          <Icons.prescription className="w-5 h-5 text-green-500" />
                          <p className="font-bold text-sm text-[var(--foreground)]">Prescription:</p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-[var(--muted-foreground)] pl-7">{rx.prescription}</p>
                      </div>

                      {rx.dispensed_at && (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <Icons.checkCircle className="w-4 h-4 text-green-500" />
                          <span>Dispensed on: {new Date(rx.dispensed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {rx.status === 'pending' && (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <button
                          onClick={() => markAsDispensed(rx.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
                        >
                          <Icons.checkCircle className="w-4 h-4" />
                          Mark Dispensed
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
