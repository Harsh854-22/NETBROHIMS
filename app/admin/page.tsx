'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout, createUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient'
  phone?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'patients' | 'appointments'>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    setLoading(false)
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#006989' }}>Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-500">{currentUser?.role}</p>
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

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-lg shadow-sm p-1">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'dashboard' ? { backgroundColor: '#006989' } : {}}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all ${
                activeTab === 'doctors'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'doctors' ? { backgroundColor: '#006989' } : {}}
            >
              👨‍⚕️ Doctors
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all ${
                activeTab === 'patients'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'patients' ? { backgroundColor: '#006989' } : {}}
            >
              🧑‍🤝‍🧑 Patients
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all ${
                activeTab === 'appointments'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'appointments' ? { backgroundColor: '#006989' } : {}}
            >
              📅 Appointments
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'doctors' && <DoctorsView currentUserId={currentUser?.id || ''} />}
          {activeTab === 'patients' && <PatientsView currentUserId={currentUser?.id || ''} />}
          {activeTab === 'appointments' && <AppointmentsView currentUserId={currentUser?.id || ''} />}
        </div>
      </div>
    </div>
  )
}

function DashboardView() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
      supabase.from('doctors').select('id', { count: 'exact', head: true }),
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true })
    ])

    setStats({
      doctors: doctorsRes.count || 0,
      patients: patientsRes.count || 0,
      appointments: appointmentsRes.count || 0
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: '#006989' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Doctors</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#006989' }}>{stats.doctors}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EAEBED' }}>
            <span className="text-2xl">👨‍⚕️</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Patients</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.patients}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
            <span className="text-2xl">🧑‍🤝‍🧑</span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Appointments</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.appointments}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
            <span className="text-2xl">📅</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DoctorsView({ currentUserId }: { currentUserId: string }) {
  const [doctors, setDoctors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    qualification: '',
    experience_years: ''
  })

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (id, name, email, phone)
      `)

    if (!error && data) {
      setDoctors(data)
    }
  }

  const handleDeleteDoctor = async (doctorId: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this doctor? This will also delete all associated appointments.')) {
      return
    }

    // Delete appointments first (due to foreign key constraint)
    await supabase.from('appointments').delete().eq('doctor_id', doctorId)
    
    // Delete doctor profile
    const { error: doctorError } = await supabase.from('doctors').delete().eq('id', doctorId)
    
    if (doctorError) {
      alert('Error deleting doctor profile')
      return
    }

    // Delete user account
    const { error: userError } = await supabase.from('users').delete().eq('id', userId)
    
    if (userError) {
      alert('Error deleting user account')
      return
    }

    alert('Doctor deleted successfully!')
    loadDoctors()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create user
    const user = await createUser(formData.email, formData.name, 'doctor', formData.password, formData.phone)
    
    if (!user) {
      alert('Error creating doctor user')
      return
    }

    // Create doctor profile
    const { error } = await supabase.from('doctors').insert({
      user_id: user.id,
      specialization: formData.specialization,
      qualification: formData.qualification,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
    })

    if (error) {
      alert('Error creating doctor profile')
      return
    }

    alert('Doctor created successfully!')
    setShowForm(false)
    setFormData({ name: '', email: '', phone: '', password: '', specialization: '', qualification: '', experience_years: '' })
    loadDoctors()
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Doctors Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        >
          {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            Create Doctor
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.specialization}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.experience_years} years</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.users?.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PatientsView({ currentUserId }: { currentUserId: string }) {
  const [patients, setPatients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    date_of_birth: '',
    gender: '',
    address: '',
    medical_history: ''
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users:user_id (id, name, email, phone)
      `)

    if (!error && data) {
      setPatients(data)
    }
  }

  const handleDeletePatient = async (patientId: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This will also delete all associated appointments and medical records.')) {
      return
    }

    // Delete appointments first (due to foreign key constraint)
    await supabase.from('appointments').delete().eq('patient_id', patientId)
    
    // Delete patient profile
    const { error: patientError } = await supabase.from('patients').delete().eq('id', patientId)
    
    if (patientError) {
      alert('Error deleting patient profile')
      return
    }

    // Delete user account
    const { error: userError } = await supabase.from('users').delete().eq('id', userId)
    
    if (userError) {
      alert('Error deleting user account')
      return
    }

    alert('Patient deleted successfully!')
    loadPatients()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create user
    const user = await createUser(formData.email, formData.name, 'patient', formData.password, formData.phone)
    
    if (!user) {
      alert('Error creating patient user')
      return
    }

    // Create patient profile
    const { error } = await supabase.from('patients').insert({
      user_id: user.id,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      address: formData.address || null,
      medical_history: formData.medical_history || null
    })

    if (error) {
      alert('Error creating patient profile')
      return
    }

    alert('Patient created successfully!')
    setShowForm(false)
    setFormData({ name: '', email: '', phone: '', password: '', date_of_birth: '', gender: '', address: '', medical_history: '' })
    loadPatients()
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Patients Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        >
          {showForm ? 'Cancel' : 'Add Patient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700">Medical History</label>
              <textarea
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                rows={3}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            Create Patient
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{patient.users?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{patient.users?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{patient.users?.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{patient.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{patient.date_of_birth}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeletePatient(patient.id, patient.users?.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AppointmentsView({ currentUserId }: { currentUserId: string }) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
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
  }, [])

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          users:user_id (name, email)
        ),
        doctors (
          id,
          users:user_id (name, email),
          specialization
        )
      `)
      .order('appointment_date', { ascending: false })

    if (!error && data) {
      setAppointments(data)
    }
  }

  const loadDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (id, name, email)
      `)
    if (data) setDoctors(data)
  }

  const loadPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select(`
        *,
        users:user_id (id, name, email)
      `)
    if (data) setPatients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.from('appointments').insert({
      patient_id: formData.patient_id,
      doctor_id: formData.doctor_id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      reason: formData.reason,
      status: 'pending',
      created_by: currentUserId
    })

    if (error) {
      alert('Error creating appointment')
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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Appointments Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        >
          {showForm ? 'Cancel' : 'Schedule Appointment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">Patient</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.users?.name} - {patient.users?.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Doctor</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.users?.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Time</label>
              <input
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700">Reason for Visit</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                rows={3}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
          >
            Schedule Appointment
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.patients?.users?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {appointment.doctors?.users?.name}
                  <br />
                  <span className="text-xs text-gray-500">{appointment.doctors?.specialization}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.appointment_date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.appointment_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4">{appointment.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
