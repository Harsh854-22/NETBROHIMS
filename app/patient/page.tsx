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
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

type Appointment = {
  id: string
  appointment_date: string
  appointment_time: string
  reason: string
  status: string
  doctor_notes?: string
  prescription?: string
  completed_at?: string
  doctors?: {
    specialization?: string
    users?: {
      name: string
      email: string
      phone?: string
    }
  }
}

export default function PatientPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [patientId, setPatientId] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-[var(--primary)] border-r-transparent opacity-75"></div>
          <p className="mt-4 text-[var(--muted-foreground)] font-medium">Loading...</p>
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] shadow-lg">
              <Icons.user className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Patient Portal</h1>
              <p className="text-sm text-[var(--muted-foreground)]">View your appointments and prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Patient</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8 relative z-10">
        <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm animate-fadeIn hover-lift">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent">My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--muted)] mb-4">
                <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[var(--muted-foreground)] font-medium mb-2">You don&apos;t have any appointments yet.</p>
              <p className="text-sm text-[var(--muted-foreground)] opacity-70">Please contact the hospital admin to schedule an appointment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getStatusColor(appointment.status)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] flex items-center justify-center">
                          <Icons.stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[var(--foreground)]">Dr. {appointment.doctors?.users?.name}</h3>
                          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <Icons.hospital className="w-3 h-3" />
                            {appointment.doctors?.specialization || 'General Physician'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="font-semibold text-[var(--foreground)]">Date:</span>
                          <span className="text-[var(--muted-foreground)]">{appointment.appointment_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="font-semibold text-[var(--foreground)]">Time:</span>
                          <span className="text-[var(--muted-foreground)]">{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="font-semibold text-[var(--foreground)]">Phone:</span>
                          <span className="text-[var(--muted-foreground)]">{appointment.doctors?.users?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.mail className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="font-semibold text-[var(--foreground)]">Email:</span>
                          <span className="text-[var(--muted-foreground)] truncate">{appointment.doctors?.users?.email || 'N/A'}</span>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div className="mt-4 p-4 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
                            <Icons.clipboard className="w-4 h-4" />
                            Reason for Visit
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">{appointment.reason}</p>
                        </div>
                      )}

                      {appointment.doctor_notes && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <Icons.notes className="w-4 h-4" />
                            Doctor&apos;s Notes
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{appointment.doctor_notes}</p>
                        </div>
                      )}

                      {appointment.prescription && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                          <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                            <Icons.prescription className="w-4 h-4" />
                            Prescription
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{appointment.prescription}</p>
                        </div>
                      )}

                      {appointment.completed_at && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Icons.checkCircle className="w-4 h-4 text-green-600" />
                            Completed on {new Date(appointment.completed_at).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {appointment.status === 'accepted' && !appointment.completed_at && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2 font-semibold">
                            <Icons.checkCircle className="w-5 h-5" />
                            Appointment Confirmed!
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">Please arrive 10-15 minutes early for registration.</p>
                        </div>
                      )}

                      {appointment.status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2 font-semibold">
                            <Icons.warning className="w-5 h-5" />
                            Appointment Not Available
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-1">Please contact the hospital to reschedule.</p>
                        </div>
                      )}

                      {appointment.status === 'rescheduled' && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 font-semibold">
                            <Icons.calendar className="w-5 h-5" />
                            Appointment Rescheduled
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Please check the updated date and time above.</p>
                        </div>
                      )}

                      {appointment.status === 'pending' && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2 font-semibold">
                            <Icons.clock className="w-5 h-5" />
                            Awaiting Confirmation
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">The doctor will review and confirm your appointment soon.</p>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase flex items-center gap-1 ${
                      appointment.status === 'pending' ? 'bg-yellow-500 text-white' :
                      appointment.status === 'accepted' ? 'bg-green-500 text-white' :
                      appointment.status === 'rejected' ? 'bg-red-500 text-white' :
                      appointment.status === 'rescheduled' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {appointment.status === 'pending' && <Icons.clock className="w-3 h-3" />}
                      {appointment.status === 'accepted' && <Icons.checkCircle className="w-3 h-3" />}
                      {appointment.status === 'rejected' && <Icons.x className="w-3 h-3" />}
                      {appointment.status === 'completed' && <Icons.check className="w-3 h-3" />}
                      {appointment.status}
                    </span>
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
