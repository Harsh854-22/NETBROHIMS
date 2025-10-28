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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#EAEBED' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent" style={{ color: '#006989' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#006989' }}>Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">Dr. {currentUser?.name}</p>
              <p className="text-[10px] text-gray-500">Physician</p>
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
            <h2 className="text-lg font-bold" style={{ color: '#006989' }}>My Appointments</h2>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="🔍 Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs"
              />
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
                  onClick={() => setFilter('accepted')}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${filter === 'accepted' ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'}`}
                  style={filter === 'accepted' ? { backgroundColor: '#006989' } : {}}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${filter === 'completed' ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'}`}
                  style={filter === 'completed' ? { backgroundColor: '#006989' } : {}}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-xs">No appointments found</p>
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      case 'rescheduled': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
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
    <div className={`border-2 rounded-lg p-4 ${getStatusColor(appointment.status)}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {/* Patient Name and Status */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-base font-bold">{appointment.patients?.users?.name}</h3>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white uppercase">
              {appointment.status}
            </span>
          </div>
          
          {/* Appointment Details */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <p className="text-gray-700">📅 <span className="font-semibold">Date:</span> {appointment.appointment_date}</p>
              <p className="text-gray-700">🕐 <span className="font-semibold">Time:</span> {appointment.appointment_time}</p>
            </div>
            <div>
              <p className="text-gray-700">📧 {appointment.patients?.users?.email}</p>
              <p className="text-gray-700">📞 {appointment.patients?.users?.phone || 'N/A'}</p>
            </div>
          </div>

          {appointment.reason && (
            <p className="text-xs mb-2 bg-white/50 p-2 rounded"><strong>Reason:</strong> {appointment.reason}</p>
          )}

          {/* Patient Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium hover:underline mb-2"
            style={{ color: '#006989' }}
          >
            {showDetails ? '▼ Hide Patient Details' : '▶ Show Patient Details'}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-white rounded border text-xs">
              <h4 className="font-bold mb-2">Patient Information</h4>
              <p><strong>Gender:</strong> {appointment.patients?.gender || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {appointment.patients?.date_of_birth || 'N/A'}</p>
              {appointment.patients?.medical_history && (
                <p className="mt-2"><strong>Medical History:</strong> {appointment.patients.medical_history}</p>
              )}
            </div>
          )}

          {/* Saved Notes and Prescription */}
          {(appointment.doctor_notes || appointment.prescription) && (
            <div className="mt-3 p-3 bg-white rounded border text-xs space-y-2">
              {appointment.doctor_notes && (
                <div>
                  <strong className="text-blue-700">📝 Doctor Notes:</strong>
                  <p className="mt-1 text-gray-700">{appointment.doctor_notes}</p>
                </div>
              )}
              {appointment.prescription && (
                <div>
                  <strong className="text-green-700">💊 Prescription:</strong>
                  <p className="mt-1 text-gray-700">{appointment.prescription}</p>
                </div>
              )}
            </div>
          )}

          {appointment.completed_at && (
            <p className="mt-2 text-xs text-gray-600">✓ Completed on: {new Date(appointment.completed_at).toLocaleString()}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'accepted')}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium whitespace-nowrap"
              >
                ✓ Accept
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reject this appointment?')) {
                    onUpdateStatus(appointment.id, 'rejected')
                  }
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium whitespace-nowrap"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => setShowRescheduleForm(!showRescheduleForm)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium whitespace-nowrap"
              >
                📅 Reschedule
              </button>
            </>
          )}
          
          {(appointment.status === 'accepted' || appointment.status === 'rescheduled') && (
            <>
              <button
                onClick={() => setShowNotesForm(!showNotesForm)}
                className="px-3 py-1.5 text-white rounded hover:bg-opacity-90 text-xs font-medium whitespace-nowrap"
                style={{ backgroundColor: '#006989' }}
              >
                📝 {appointment.doctor_notes || appointment.prescription ? 'Edit Notes' : 'Add Notes'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Mark this appointment as completed?')) {
                    onUpdateStatus(appointment.id, 'completed')
                  }
                }}
                className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 text-xs font-medium whitespace-nowrap"
              >
                ✓ Complete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reschedule Form */}
      {showRescheduleForm && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300">
          <h4 className="font-bold text-sm mb-3" style={{ color: '#006989' }}>Reschedule Appointment</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2 py-1.5 border rounded text-xs"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2 py-1.5 border rounded text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReschedule}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
            >
              Save Reschedule
            </button>
            <button
              onClick={() => setShowRescheduleForm(false)}
              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes and Prescription Form */}
      {showNotesForm && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2" style={{ borderColor: '#006989' }}>
          <h4 className="font-bold text-sm mb-3" style={{ color: '#006989' }}>Add Notes & Prescription</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Doctor Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your observations, diagnosis, or recommendations..."
                className="w-full px-3 py-2 border rounded text-xs"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Prescription</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter medications, dosage, and instructions..."
                className="w-full px-3 py-2 border rounded text-xs"
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1.5 text-white rounded hover:bg-opacity-90 text-xs font-medium"
              style={{ backgroundColor: '#006989' }}
            >
              💾 Save Notes
            </button>
            <button
              onClick={() => setShowNotesForm(false)}
              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
