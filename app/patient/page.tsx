'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient'
  phone?: string
}

export default function PatientPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [patientId, setPatientId] = useState<string>('')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (patientId) {
      loadAppointments()
    }
  }, [patientId])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'patient') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Get patient profile
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (patient) {
      setPatientId(patient.id)
    }
    setLoading(false)
  }

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (
          id,
          users:user_id (name, email, phone),
          specialization,
          qualification
        )
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      case 'rescheduled': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAEBED' }}>
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#006989' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#006989' }}>Patient Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-500">Patient</p>
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
          <h2 className="text-lg font-bold mb-4" style={{ color: '#006989' }}>My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2 text-xs">You don't have any appointments yet.</p>
              <p className="text-[10px] text-gray-400">Please contact the hospital admin to schedule an appointment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={`border-2 rounded-lg p-3 ${getStatusColor(appointment.status)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold">Dr. {appointment.doctors?.users?.name}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white">
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-gray-700">📅 <strong>Date:</strong> {appointment.appointment_date}</p>
                          <p className="text-gray-700">🕐 <strong>Time:</strong> {appointment.appointment_time}</p>
                        </div>
                        <div>
                          <p className="text-gray-700">🏥 <strong>Specialization:</strong> {appointment.doctors?.specialization || 'General'}</p>
                          <p className="text-gray-700">📞 <strong>Phone:</strong> {appointment.doctors?.users?.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {appointment.reason && (
                        <p className="text-sm mt-2"><strong>Reason:</strong> {appointment.reason}</p>
                      )}

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm"><strong>Doctor's Notes:</strong> {appointment.notes}</p>
                        </div>
                      )}

                      {appointment.status === 'accepted' && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">✓ Your appointment has been confirmed. Please arrive 10 minutes early.</p>
                        </div>
                      )}

                      {appointment.status === 'rejected' && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">✗ This appointment was rejected. Please contact the hospital for rescheduling.</p>
                        </div>
                      )}

                      {appointment.status === 'rescheduled' && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">📅 This appointment has been rescheduled. Check the notes for new timing.</p>
                        </div>
                      )}
                    </div>
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
