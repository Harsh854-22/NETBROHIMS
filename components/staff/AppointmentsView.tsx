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
  users?: {
    name: string
    email: string
  }
  specialization?: string
}

type Patient = {
  id: string
  users?: {
    name: string
    email: string
    phone?: string
  }
}

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load appointments
    const { data: appointmentsData, error: appointmentsError } = await supabase
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
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })

    // Load doctors
    const { data: doctorsData } = await supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        users:user_id (name, email)
      `)

    // Load patients
    const { data: patientsData } = await supabase
      .from('patients')
      .select(`
        id,
        users:user_id (name, email, phone)
      `)
      .order('created_at', { ascending: false })

    if (appointmentsError) {
      console.error('Error loading appointments:', appointmentsError)
    } else {
      setAppointments(appointmentsData || [])
    }

    // Transform doctors data to handle array response
    const transformedDoctors = (doctorsData || []).map((d: {
      id: string
      specialization?: string
      users: { name: string; email: string }[]
    }) => ({
      id: d.id,
      specialization: d.specialization,
      users: Array.isArray(d.users) && d.users.length > 0 ? d.users[0] : undefined
    }))

    // Transform patients data to handle array response
    const transformedPatients = (patientsData || []).map((p: {
      id: string
      users: { name: string; email: string; phone?: string }[]
    }) => ({
      id: p.id,
      users: Array.isArray(p.users) && p.users.length > 0 ? p.users[0] : undefined
    }))

    setDoctors(transformedDoctors)
    setPatients(transformedPatients)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAppointment) {
      // Update existing appointment (reschedule)
      const submitData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: editingAppointment.status
      }

      const { error } = await supabase
        .from('appointments')
        .update(submitData)
        .eq('id', editingAppointment.id)

      if (error) {
        console.error('Error updating appointment:', error)
        alert('Error updating appointment: ' + (error.message || 'Unknown error'))
      } else {
        alert('Appointment rescheduled successfully!')
      }
    } else {
      // Create new appointment - need current user ID
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        alert('Error: User not logged in')
        return
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          reason: formData.reason,
          status: 'pending',
          created_by: currentUser.id
        }])

      if (error) {
        console.error('Error creating appointment:', error)
        alert('Error creating appointment: ' + (error.message || 'Unknown error'))
      } else {
        alert('Appointment scheduled successfully!')
      }
    }

    setShowModal(false)
    setEditingAppointment(null)
    resetForm()
    loadData()
  }

  const handleReschedule = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'rescheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patients?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctors?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Appointment Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Schedule and reschedule patient appointments</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingAppointment(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
        >
          <Icons.plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Search */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-4 mb-6 shadow-lg">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient, doctor, or reason..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Icons.user className="w-5 h-5 text-[var(--muted-foreground)]" />
                        <h3 className="text-lg font-bold text-[var(--foreground)]">{appointment.patients?.users?.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Icons.stethoscope className="w-4 h-4" />
                        <span>Dr. {appointment.doctors?.users?.name}</span>
                        {appointment.doctors?.specialization && (
                          <span className="text-xs">({appointment.doctors.specialization})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-2">
                          <Icons.calendar className="w-4 h-4" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.clock className="w-4 h-4" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReschedule(appointment)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                  >
                    <Icons.calendar className="w-4 h-4" />
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAppointments.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl">
          <Icons.calendar className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No appointments found</p>
        </div>
      )}

      {/* Schedule/Reschedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">
              {editingAppointment ? 'Reschedule Appointment' : 'Schedule New Appointment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Patient *</label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.users?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Doctor *</label>
                <select
                  required
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.users?.name} {doctor.specialization && `- ${doctor.specialization}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Time *</label>
                <input
                  type="time"
                  required
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  rows={3}
                  placeholder="Reason for appointment"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAppointment(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-[var(--border)] rounded-lg hover:bg-[var(--accent)] font-semibold text-[var(--foreground)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                >
                  {editingAppointment ? 'Reschedule' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
