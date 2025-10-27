'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient'
  phone?: string
}

export default function DoctorPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [doctorId, setDoctorId] = useState<string>('')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (doctorId) {
      loadAppointments()
    }
  }, [doctorId, filter])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'doctor') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    
    // Get doctor profile
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (doctor) {
      setDoctorId(doctor.id)
    }
    setLoading(false)
  }

  const loadAppointments = async () => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          users:user_id (name, email, phone),
          date_of_birth,
          gender,
          medical_history
        )
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setAppointments(data)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status, notes })
      .eq('id', appointmentId)

    if (error) {
      alert('Error updating appointment')
      return
    }

    alert(`Appointment ${status} successfully!`)
    loadAppointments()
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, Dr. {currentUser?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Appointments</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('accepted')}
                className={`px-4 py-2 rounded ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
              >
                Completed
              </button>
            </div>
          </div>

          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No appointments found</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onUpdate={updateAppointmentStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({ appointment, onUpdate }: { appointment: any; onUpdate: (id: string, status: string, notes?: string) => void }) {
  const [showDetails, setShowDetails] = useState(false)
  const [notes, setNotes] = useState(appointment.notes || '')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getStatusColor(appointment.status)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-lg font-semibold">{appointment.patients?.users?.name}</h3>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white">
              {appointment.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <p className="text-gray-600">📅 Date: <span className="font-medium">{appointment.appointment_date}</span></p>
              <p className="text-gray-600">🕐 Time: <span className="font-medium">{appointment.appointment_time}</span></p>
            </div>
            <div>
              <p className="text-gray-600">📧 Email: <span className="font-medium">{appointment.patients?.users?.email}</span></p>
              <p className="text-gray-600">📞 Phone: <span className="font-medium">{appointment.patients?.users?.phone || 'N/A'}</span></p>
            </div>
          </div>

          {appointment.reason && (
            <p className="text-sm mb-2"><strong>Reason:</strong> {appointment.reason}</p>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:underline mb-2"
          >
            {showDetails ? '▼ Hide Details' : '▶ Show Patient Details'}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h4 className="font-semibold mb-2">Patient Information</h4>
              <p className="text-sm"><strong>Gender:</strong> {appointment.patients?.gender || 'N/A'}</p>
              <p className="text-sm"><strong>Date of Birth:</strong> {appointment.patients?.date_of_birth || 'N/A'}</p>
              {appointment.patients?.medical_history && (
                <p className="text-sm mt-2"><strong>Medical History:</strong> {appointment.patients.medical_history}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdate(appointment.id, 'accepted')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                ✓ Accept
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Reason for rejection (optional):')
                  onUpdate(appointment.id, 'rejected', reason || undefined)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => {
                  const newDate = prompt('Enter new date (YYYY-MM-DD):')
                  const newTime = prompt('Enter new time (HH:MM):')
                  if (newDate && newTime) {
                    onUpdate(appointment.id, 'rescheduled', `Rescheduled to ${newDate} at ${newTime}`)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                📅 Reschedule
              </button>
            </>
          )}
          {appointment.status === 'accepted' && (
            <button
              onClick={() => {
                const completionNotes = prompt('Add completion notes (optional):')
                onUpdate(appointment.id, 'completed', completionNotes || undefined)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
              ✓ Mark Complete
            </button>
          )}
        </div>
      </div>

      {appointment.notes && (
        <div className="mt-3 p-2 bg-white rounded text-sm">
          <strong>Notes:</strong> {appointment.notes}
        </div>
      )}
    </div>
  )
}
