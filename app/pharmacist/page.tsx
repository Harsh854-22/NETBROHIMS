'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EAEBED' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent" style={{ color: '#006989' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!pharmacyShopId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EAEBED' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 font-semibold">You are not assigned to any pharmacy shop!</p>
          <p className="text-sm text-gray-600 mt-2">Please contact the administrator.</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAEBED' }}>
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#006989' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#006989' }}>Pharmacist Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-500">Pharmacist</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-xs shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#006989' }}>Prescription Queue</h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${filter === 'all' ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'}`}
                style={filter === 'all' ? { backgroundColor: '#006989' } : {}}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${filter === 'pending' ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'}`}
                style={filter === 'pending' ? { backgroundColor: '#006989' } : {}}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('dispensed')}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${filter === 'dispensed' ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'}`}
                style={filter === 'dispensed' ? { backgroundColor: '#006989' } : {}}
              >
                Dispensed
              </button>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-xs">No prescriptions found</p>
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
