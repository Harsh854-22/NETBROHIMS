'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Icons } from '@/components/Icons'

type Appointment = {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  reason?: string
  status: string
  patients?: {
    id: string
    users?: {
      name: string
      email: string
      phone?: string
    }
  }
  doctors?: {
    id: string
    specialization?: string
    users?: {
      name: string
      email: string
      phone?: string
    }
  }
}

type Doctor = {
  id: string
  user_id: string
  specialization?: string
  users?: {
    id: string
    name: string
    email: string
  }
}

type Patient = {
  id: string
  user_id: string
  users?: {
    id: string
    name: string
    email: string
  }
}

type AppointmentsViewProps = {
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentUserId: string
}

export default function AppointmentsView({ searchTerm, setSearchTerm, currentUserId }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  })

  useEffect(() => {
    loadAppointments()
    loadDoctors()
    loadPatients()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadAppointments()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [currentUserId])

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          users:user_id (name, email, phone)
        ),
        doctors (
          id,
          users:user_id (name, email, phone),
          specialization
        )
      `)
      .eq('created_by_admin_id', currentUserId) // Filter by current admin
      .order('appointment_date', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)
    
    if (error) {
      alert('Error deleting appointment')
      return
    }

    alert('Appointment deleted successfully!')
    loadAppointments()
  }

  const handleSendReminder = async (appointment: Appointment) => {
    try {
      const response = await fetch('/api/send-appointment-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: appointment.patients?.users?.email,
          patientName: appointment.patients?.users?.name,
          patientPhone: appointment.patients?.users?.phone,
          doctorName: appointment.doctors?.users?.name,
          doctorPhone: appointment.doctors?.users?.phone,
          doctorSpecialization: appointment.doctors?.specialization,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          reason: appointment.reason
        })
      })

      if (response.ok) {
        alert('Reminder sent successfully!')
      } else {
        alert('Failed to send reminder')
      }
    } catch {
      alert('Error sending reminder')
    }
  }

  const loadDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (id, name, email)
      `)
      .eq('created_by_admin_id', currentUserId) // Filter by current admin
    if (data) setDoctors(data)
  }

  const loadPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select(`
        *,
        users:user_id (id, name, email)
      `)
      .eq('created_by_admin_id', currentUserId) // Filter by current admin
    if (data) setPatients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Get current admin user ID
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      alert('Error: User not logged in')
      return
    }
    
    const { error } = await supabase.from('appointments').insert({
      patient_id: formData.patient_id,
      doctor_id: formData.doctor_id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      reason: formData.reason,
      status: 'pending',
      created_by: currentUser.id,
      created_by_admin_id: currentUserId // Track which admin created this appointment
    })

    if (error) {
      console.error('Error creating appointment:', error)
      alert('Error creating appointment: ' + (error.message || 'Unknown error'))
      return
    }

    alert('Appointment scheduled successfully!')
    setShowForm(false)
    setFormData({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '' })
    loadAppointments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'rescheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Icons.calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">Appointments Management</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.search className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-105 whitespace-nowrap ${
              showForm 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}
          >
            {showForm ? (
              <>
                <Icons.x className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Icons.plus className="w-4 h-4" />
                Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-[var(--border)] bg-[var(--muted)]/30 rounded-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Icons.calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">Schedule New Appointment</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Select Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              >
                <option value="">Choose a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.users?.name} - {patient.users?.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Select Doctor *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.users?.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Appointment Time *</label>
              <input
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Reason for Visit</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Describe the reason for this appointment..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
          >
            <Icons.check className="w-4 h-4" />
            Schedule Appointment
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border-2 border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--muted)]/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Patient</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
            {appointments
              .filter(appointment => {
                if (!searchTerm) return true
                const search = searchTerm.toLowerCase()
                return (
                  appointment.patients?.users?.name?.toLowerCase().includes(search) ||
                  appointment.doctors?.users?.name?.toLowerCase().includes(search) ||
                  appointment.status?.toLowerCase().includes(search) ||
                  appointment.reason?.toLowerCase().includes(search) ||
                  appointment.appointment_date?.includes(searchTerm)
                )
              })
              .map((appointment) => (
              <tr key={appointment.id} className="hover:bg-[var(--accent)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Icons.user className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{appointment.patients?.users?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
                      <Icons.stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--foreground)]">Dr. {appointment.doctors?.users?.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{appointment.doctors?.specialization}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-2">
                    <Icons.calendar className="w-4 h-4" />
                    {appointment.appointment_date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-2">
                    <Icons.clock className="w-4 h-4" />
                    {appointment.appointment_time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] max-w-xs truncate">{appointment.reason || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendReminder(appointment)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs"
                      title="Send Reminder"
                    >
                      <Icons.mail className="w-3.5 h-3.5" />
                      Remind
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs"
                      title="Delete Appointment"
                    >
                      <Icons.trash className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}