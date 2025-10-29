'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
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
  patient_id: string
  appointment_date: string
  appointment_time: string
  reason?: string
  status: string
  doctor_notes?: string
  prescription?: string
  completed_at?: string
  patients?: {
    id: string
    users?: {
      name: string
      email: string
      phone?: string
    }
    date_of_birth?: string
    gender?: string
    medical_history?: string
  }
}

export default function DoctorPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [doctorId, setDoctorId] = useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const updateData: { status: string; completed_at?: string } = { status }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)

    if (error) {
      alert('Error updating appointment')
      return
    }

    alert(`Appointment ${status} successfully!`)
    loadAppointments()
  }

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string, oldDate: string, oldTime: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'rescheduled'
      })
      .eq('id', appointmentId)

    if (error) {
      alert('Error rescheduling appointment')
      return
    }

    // Get appointment details for email
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (users:user_id (name, email)),
        doctors (users:user_id (name), specialization)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointment) {
      // Send reschedule notification email
      try {
        await fetch('/api/send-reschedule-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientEmail: appointment.patients?.users?.email,
            patientName: appointment.patients?.users?.name,
            doctorName: appointment.doctors?.users?.name,
            doctorSpecialization: appointment.doctors?.specialization,
            oldDate,
            oldTime,
            newDate,
            newTime,
            reason: appointment.reason
          })
        })
      } catch (error) {
        console.error('Error sending email:', error)
      }
    }

    alert('Appointment rescheduled successfully!')
    loadAppointments()
  }

  const saveNotesAndPrescription = async (appointmentId: string, notes: string, prescription: string) => {
    // First, update the appointment with notes and prescription
    const { error } = await supabase
      .from('appointments')
      .update({ 
        doctor_notes: notes,
        prescription: prescription
      })
      .eq('id', appointmentId)

    if (error) {
      alert('Error saving notes and prescription')
      return
    }

    // If there's a prescription, send it to the assigned pharmacy
    if (prescription && prescription.trim()) {
      try {
        // Get the appointment details with patient info
        const { data: appointment } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (id, users:user_id (name, phone))
          `)
          .eq('id', appointmentId)
          .single()

        if (appointment) {
          // Check if doctor is assigned to a pharmacy
          const { data: assignment } = await supabase
            .from('doctor_pharmacy_assignments')
            .select('pharmacy_shop_id')
            .eq('doctor_id', doctorId)
            .single()

          if (assignment) {
            // Add prescription to pharmacy queue
            await supabase.from('prescription_queue').insert({
              appointment_id: appointmentId,
              pharmacy_shop_id: assignment.pharmacy_shop_id,
              doctor_id: doctorId,
              patient_id: appointment.patient_id,
              prescription: prescription,
              doctor_notes: notes,
              status: 'pending'
            })
            
            alert('Notes and prescription saved! Prescription sent to pharmacy ✅')
          } else {
            alert('Notes and prescription saved! (No pharmacy assigned to you)')
          }
        }
      } catch (error) {
        console.error('Error sending to pharmacy:', error)
        alert('Notes saved, but failed to send to pharmacy')
      }
    } else {
      alert('Notes saved successfully!')
    }

    loadAppointments()
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
              <Icons.stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Doctor Dashboard</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">Manage your appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--foreground)]">Dr. {currentUser?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Physician</p>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Icons.calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">My Appointments</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white shadow-md' 
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
                  onClick={() => setFilter('accepted')}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                    filter === 'accepted' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' 
                      : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:scale-105 ${
                    filter === 'completed' 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md' 
                      : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--muted)] mb-4">
                <Icons.calendar className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-[var(--muted-foreground)] font-medium text-lg">No appointments found</p>
              <p className="text-[var(--muted-foreground)] text-sm mt-2">Your appointment schedule will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(appointment => {
                  if (!searchTerm) return true
                  const search = searchTerm.toLowerCase()
                  return (
                    appointment.patients?.users?.name?.toLowerCase().includes(search) ||
                    appointment.patients?.users?.email?.toLowerCase().includes(search) ||
                    appointment.reason?.toLowerCase().includes(search)
                  )
                })
                .map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onUpdateStatus={updateAppointmentStatus}
                  onReschedule={rescheduleAppointment}
                  onSaveNotes={saveNotesAndPrescription}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({ 
  appointment, 
  onUpdateStatus, 
  onReschedule,
  onSaveNotes
}: { 
  appointment: Appointment
  onUpdateStatus: (id: string, status: string) => void
  onReschedule: (id: string, newDate: string, newTime: string, oldDate: string, oldTime: string) => void
  onSaveNotes: (id: string, notes: string, prescription: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showNotesForm, setShowNotesForm] = useState(false)
  const [notes, setNotes] = useState(appointment.doctor_notes || '')
  const [prescription, setPrescription] = useState(appointment.prescription || '')
  const [showRescheduleForm, setShowRescheduleForm] = useState(false)
  const [newDate, setNewDate] = useState(appointment.appointment_date)
  const [newTime, setNewTime] = useState(appointment.appointment_time)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
      case 'accepted': return 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
      case 'rejected': return 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700'
      case 'rescheduled': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
      case 'completed': return 'bg-gray-50 dark:bg-gray-950/20 border-gray-300 dark:border-gray-700'
      default: return 'bg-[var(--muted)] border-[var(--border)]'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white'
      case 'accepted': return 'bg-green-500 text-white'
      case 'rejected': return 'bg-red-500 text-white'
      case 'rescheduled': return 'bg-blue-500 text-white'
      case 'completed': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const handleSaveNotes = () => {
    if (!notes.trim() && !prescription.trim()) {
      alert('Please add notes or prescription before saving')
      return
    }
    onSaveNotes(appointment.id, notes, prescription)
    setShowNotesForm(false)
  }

  const handleReschedule = () => {
    if (!newDate || !newTime) {
      alert('Please select both date and time')
      return
    }
    onReschedule(appointment.id, newDate, newTime, appointment.appointment_date, appointment.appointment_time)
    setShowRescheduleForm(false)
  }

  return (
    <div className={`border-2 rounded-xl p-6 ${getStatusColor(appointment.status)} transition-all hover:shadow-md`}>
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          {/* Patient Name and Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
              <Icons.user className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--foreground)]">{appointment.patients?.users?.name}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase ${getStatusBadgeColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
          
          {/* Appointment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <Icons.calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="font-semibold">Date:</span>
                <span>{appointment.appointment_date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <Icons.clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="font-semibold">Time:</span>
                <span>{appointment.appointment_time}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <Icons.mail className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="truncate">{appointment.patients?.users?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <Icons.phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span>{appointment.patients?.users?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {appointment.reason && (
            <div className="p-3 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
              <div className="flex items-start gap-2">
                <Icons.info className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-sm font-semibold text-[var(--foreground)]">Reason:</strong>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{appointment.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--gradient-from)] transition-colors"
          >
            <Icons.chevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide Patient Details' : 'Show Patient Details'}
          </button>

          {showDetails && (
            <div className="p-4 bg-[var(--card)] rounded-lg border-2 border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Icons.userCircle className="w-5 h-5 text-[var(--gradient-from)]" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">Patient Information</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-[var(--foreground)]"><strong>Gender:</strong> {appointment.patients?.gender || 'N/A'}</p>
                <p className="text-[var(--foreground)]"><strong>Date of Birth:</strong> {appointment.patients?.date_of_birth || 'N/A'}</p>
                {appointment.patients?.medical_history && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <strong className="text-[var(--foreground)]">Medical History:</strong>
                    <p className="mt-1 text-[var(--muted-foreground)]">{appointment.patients.medical_history}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved Notes and Prescription */}
          {(appointment.doctor_notes || appointment.prescription) && (
            <div className="p-4 bg-[var(--card)] rounded-lg border-2 border-[var(--border)] space-y-3">
              {appointment.doctor_notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.notes className="w-5 h-5 text-blue-500" />
                    <strong className="text-sm font-semibold text-[var(--foreground)]">Doctor Notes:</strong>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] pl-7">{appointment.doctor_notes}</p>
                </div>
              )}
              {appointment.prescription && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.prescription className="w-5 h-5 text-green-500" />
                    <strong className="text-sm font-semibold text-[var(--foreground)]">Prescription:</strong>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] pl-7">{appointment.prescription}</p>
                </div>
              )}
            </div>
          )}

          {appointment.completed_at && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Icons.checkCircle className="w-4 h-4 text-green-500" />
              <span>Completed on: {new Date(appointment.completed_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'accepted')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reject this appointment?')) {
                    onUpdateStatus(appointment.id, 'rejected')
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.x className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => setShowRescheduleForm(!showRescheduleForm)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.calendar className="w-4 h-4" />
                Reschedule
              </button>
            </>
          )}
          
          {(appointment.status === 'accepted' || appointment.status === 'rescheduled') && (
            <>
              <button
                onClick={() => setShowNotesForm(!showNotesForm)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-via)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.notes className="w-4 h-4" />
                {appointment.doctor_notes || appointment.prescription ? 'Edit Notes' : 'Add Notes'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Mark this appointment as completed?')) {
                    onUpdateStatus(appointment.id, 'completed')
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.checkCircle className="w-4 h-4" />
                Complete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reschedule Form */}
      {showRescheduleForm && (
        <div className="mt-6 p-6 bg-[var(--card)] rounded-xl border-2 border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Icons.calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg text-[var(--foreground)]">Reschedule Appointment</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReschedule}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
            >
              <Icons.check className="w-4 h-4" />
              Save Reschedule
            </button>
            <button
              onClick={() => setShowRescheduleForm(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--accent)] transition-all font-semibold text-sm"
            >
              <Icons.x className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes and Prescription Form */}
      {showNotesForm && (
        <div className="mt-6 p-6 bg-[var(--card)] rounded-xl border-2 border-[var(--gradient-from)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
              <Icons.notes className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-lg text-[var(--foreground)]">Add Notes & Prescription</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Doctor Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your observations, diagnosis, or recommendations..."
                className="w-full px-4 py-3 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Prescription</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter medications, dosage, and instructions..."
                className="w-full px-4 py-3 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSaveNotes}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-via)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
            >
              <Icons.check className="w-4 h-4" />
              Save Notes
            </button>
            <button
              onClick={() => setShowNotesForm(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--accent)] transition-all font-semibold text-sm"
            >
              <Icons.x className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
