'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout, createUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'patients' | 'appointments' | 'pharmacists'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
            <button
              onClick={() => setActiveTab('pharmacists')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all ${
                activeTab === 'pharmacists'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === 'pharmacists' ? { backgroundColor: '#006989' } : {}}
            >
              💊 Pharmacists
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'doctors' && <DoctorsView currentUserId={currentUser?.id || ''} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'patients' && <PatientsView currentUserId={currentUser?.id || ''} />}
          {activeTab === 'appointments' && <AppointmentsView searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'pharmacists' && <PharmacistsView />}
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

type Doctor = {
  id: string
  user_id: string
  specialization?: string
  qualification?: string
  experience_years?: number
  users?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

function DoctorsView({ currentUserId, searchTerm, setSearchTerm }: { 
  currentUserId: string
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
          >
            {showForm ? 'Cancel' : 'Add Doctor'}
          </button>
        </div>
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
            {doctors
              .filter(doctor => {
                if (!searchTerm) return true
                const search = searchTerm.toLowerCase()
                return (
                  doctor.users?.name?.toLowerCase().includes(search) ||
                  doctor.users?.email?.toLowerCase().includes(search) ||
                  doctor.specialization?.toLowerCase().includes(search)
                )
              })
              .map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.users?.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.specialization}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{doctor.experience_years} years</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.users?.id || '')}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                    disabled={!doctor.users?.id}
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

type Patient = {
  id: string
  user_id: string
  date_of_birth?: string
  gender?: string
  address?: string
  medical_history?: string
  users?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

function PatientsView({ currentUserId }: { currentUserId: string }) {
  const [patients, setPatients] = useState<Patient[]>([])
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
                    onClick={() => handleDeletePatient(patient.id, patient.users?.id || '')}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                    disabled={!patient.users?.id}
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
    }
  }
  doctors?: {
    id: string
    specialization?: string
    users?: {
      name: string
      email: string
    }
  }
}

function AppointmentsView({ searchTerm, setSearchTerm }: {
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
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
          doctorName: appointment.doctors?.users?.name,
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
      created_by: currentUser.id
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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Appointments Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
          >
            {showForm ? 'Cancel' : 'Schedule Appointment'}
          </button>
        </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{appointment.patients?.users?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {appointment.doctors?.users?.name}
                  <br />
                  <span className="text-xs text-gray-500">{appointment.doctors?.specialization}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{appointment.appointment_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{appointment.appointment_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{appointment.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendReminder(appointment)}
                      className="px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                      title="Send Reminder"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Remind
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                      title="Delete Appointment"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

// Pharmacists Management View
function PharmacistsView() {
  const [pharmacyShops, setPharmacyShops] = useState<{
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
    license_number?: string
  }[]>([])
  const [pharmacists, setPharmacists] = useState<{
    id: string
    user_id: string
    pharmacy_shop_id?: string
    license_number?: string
    users?: {
      id: string
      name: string
      email: string
      phone?: string
    }
    pharmacy_shops?: {
      id: string
      name: string
    }
  }[]>([])
  const [doctors, setDoctors] = useState<{
    id: string
    users?: {
      id: string
      name: string
      email: string
    }
  }[]>([])
  const [activeTab, setActiveTab] = useState<'shops' | 'pharmacists' | 'assignments'>('shops')
  const [showShopForm, setShowShopForm] = useState(false)
  const [showPharmacistForm, setShowPharmacistForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [shopFormData, setShopFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    license_number: ''
  })
  const [pharmacistFormData, setPharmacistFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    pharmacy_shop_id: '',
    license_number: ''
  })
  const [assignmentFormData, setAssignmentFormData] = useState({
    doctor_id: '',
    pharmacy_shop_id: ''
  })
  const [assignments, setAssignments] = useState<{
    id: string
    doctor_id: string
    pharmacy_shop_id: string
    doctors?: {
      id: string
      users?: {
        name: string
        email: string
      }
    }
    pharmacy_shops?: {
      id: string
      name: string
    }
  }[]>([])

  useEffect(() => {
    loadPharmacyShops()
    loadPharmacists()
    loadDoctors()
    loadAssignments()
  }, [])

  const loadPharmacyShops = async () => {
    const { data, error } = await supabase
      .from('pharmacy_shops')
      .select('*')
      .order('name')

    if (!error && data) {
      setPharmacyShops(data)
    }
  }

  const loadPharmacists = async () => {
    const { data, error } = await supabase
      .from('pharmacists')
      .select(`
        *,
        users:user_id (id, name, email, phone),
        pharmacy_shops:pharmacy_shop_id (id, name)
      `)

    if (!error && data) {
      setPharmacists(data)
    }
  }

  const loadDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (id, name, email)
      `)

    if (!error && data) {
      setDoctors(data)
    }
  }

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('doctor_pharmacy_assignments')
      .select(`
        *,
        doctors (
          id,
          users:user_id (name, email)
        ),
        pharmacy_shops (id, name)
      `)

    if (!error && data) {
      setAssignments(data)
    }
  }

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.from('pharmacy_shops').insert({
      name: shopFormData.name,
      address: shopFormData.address,
      phone: shopFormData.phone,
      email: shopFormData.email,
      license_number: shopFormData.license_number
    })

    if (error) {
      alert('Error creating pharmacy shop')
      return
    }

    alert('Pharmacy shop created successfully!')
    setShowShopForm(false)
    setShopFormData({ name: '', address: '', phone: '', email: '', license_number: '' })
    loadPharmacyShops()
  }

  const handlePharmacistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create user
    const user = await createUser(pharmacistFormData.email, pharmacistFormData.name, 'pharmacist', pharmacistFormData.password, pharmacistFormData.phone)
    
    if (!user) {
      alert('Error creating pharmacist user')
      return
    }

    // Create pharmacist profile
    const { error } = await supabase.from('pharmacists').insert({
      user_id: user.id,
      pharmacy_shop_id: pharmacistFormData.pharmacy_shop_id || null,
      license_number: pharmacistFormData.license_number
    })

    if (error) {
      alert('Error creating pharmacist profile')
      return
    }

    alert('Pharmacist created successfully!')
    setShowPharmacistForm(false)
    setPharmacistFormData({ name: '', email: '', phone: '', password: '', pharmacy_shop_id: '', license_number: '' })
    loadPharmacists()
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase.from('doctor_pharmacy_assignments').insert({
      doctor_id: assignmentFormData.doctor_id,
      pharmacy_shop_id: assignmentFormData.pharmacy_shop_id
    })

    if (error) {
      if (error.code === '23505') {
        alert('This doctor is already assigned to this pharmacy!')
      } else {
        alert('Error creating assignment')
      }
      return
    }

    alert('Doctor assigned to pharmacy successfully!')
    setShowAssignmentForm(false)
    setAssignmentFormData({ doctor_id: '', pharmacy_shop_id: '' })
    loadAssignments()
  }

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure? This will unassign all pharmacists and doctors from this shop.')) {
      return
    }

    const { error } = await supabase.from('pharmacy_shops').delete().eq('id', shopId)
    
    if (error) {
      alert('Error deleting pharmacy shop')
      return
    }

    alert('Pharmacy shop deleted successfully!')
    loadPharmacyShops()
    loadPharmacists()
    loadAssignments()
  }

  const handleDeletePharmacist = async (pharmacistId: string, userId: string) => {
    if (!confirm('Are you sure you want to delete this pharmacist?')) {
      return
    }

    await supabase.from('pharmacists').delete().eq('id', pharmacistId)
    await supabase.from('users').delete().eq('id', userId)

    alert('Pharmacist deleted successfully!')
    loadPharmacists()
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) {
      return
    }

    const { error } = await supabase.from('doctor_pharmacy_assignments').delete().eq('id', assignmentId)
    
    if (error) {
      alert('Error deleting assignment')
      return
    }

    alert('Assignment removed successfully!')
    loadAssignments()
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Pharmacist & Pharmacy Management</h2>

      {/* Sub-tabs */}
      <div className="mb-4 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('shops')}
            className={`pb-2 px-1 font-medium text-xs ${activeTab === 'shops' ? 'border-b-2 text-blue-600' : 'text-gray-500'}`}
            style={activeTab === 'shops' ? { borderColor: '#006989', color: '#006989' } : {}}
          >
            🏪 Pharmacy Shops
          </button>
          <button
            onClick={() => setActiveTab('pharmacists')}
            className={`pb-2 px-1 font-medium text-xs ${activeTab === 'pharmacists' ? 'border-b-2 text-blue-600' : 'text-gray-500'}`}
            style={activeTab === 'pharmacists' ? { borderColor: '#006989', color: '#006989' } : {}}
          >
            💊 Pharmacists
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-2 px-1 font-medium text-xs ${activeTab === 'assignments' ? 'border-b-2 text-blue-600' : 'text-gray-500'}`}
            style={activeTab === 'assignments' ? { borderColor: '#006989', color: '#006989' } : {}}
          >
            🔗 Doctor-Pharmacy Links
          </button>
        </nav>
      </div>

      {/* Pharmacy Shops Tab */}
      {activeTab === 'shops' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Pharmacy Shops ({pharmacyShops.length})</h3>
            <button
              onClick={() => setShowShopForm(!showShopForm)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              {showShopForm ? 'Cancel' : '+ Add Pharmacy Shop'}
            </button>
          </div>

          {showShopForm && (
            <form onSubmit={handleShopSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={shopFormData.name}
                    onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={shopFormData.email}
                    onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={shopFormData.phone}
                    onChange={(e) => setShopFormData({ ...shopFormData, phone: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={shopFormData.license_number}
                    onChange={(e) => setShopFormData({ ...shopFormData, license_number: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700">Address</label>
                  <textarea
                    value={shopFormData.address}
                    onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                    rows={2}
                  />
                </div>
              </div>
              <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                Create Pharmacy Shop
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pharmacyShops.map((shop) => (
                  <tr key={shop.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{shop.name}</td>
                    <td className="px-6 py-4 text-sm">{shop.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shop.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shop.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shop.license_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteShop(shop.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pharmacists Tab */}
      {activeTab === 'pharmacists' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Pharmacists ({pharmacists.length})</h3>
            <button
              onClick={() => setShowPharmacistForm(!showPharmacistForm)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              {showPharmacistForm ? 'Cancel' : '+ Add Pharmacist'}
            </button>
          </div>

          {showPharmacistForm && (
            <form onSubmit={handlePharmacistSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={pharmacistFormData.name}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, name: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={pharmacistFormData.email}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, email: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={pharmacistFormData.phone}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, phone: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Password *</label>
                  <input
                    type="password"
                    required
                    value={pharmacistFormData.password}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, password: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Assign to Pharmacy</label>
                  <select
                    value={pharmacistFormData.pharmacy_shop_id}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, pharmacy_shop_id: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <option value="">Select Pharmacy (Optional)</option>
                    {pharmacyShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={pharmacistFormData.license_number}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, license_number: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  />
                </div>
              </div>
              <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                Create Pharmacist
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pharmacists.map((pharmacist) => (
                  <tr key={pharmacist.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{pharmacist.users?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{pharmacist.users?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{pharmacist.users?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{pharmacist.pharmacy_shops?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{pharmacist.license_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeletePharmacist(pharmacist.id, pharmacist.users?.id || '')}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        disabled={!pharmacist.users?.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor-Pharmacy Assignments Tab */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-sm">Doctor-Pharmacy Assignments ({assignments.length})</h3>
              <p className="text-xs text-gray-500 mt-1">Link doctors to pharmacies so prescriptions are auto-sent</p>
            </div>
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              {showAssignmentForm ? 'Cancel' : '+ Link Doctor to Pharmacy'}
            </button>
          </div>

          {showAssignmentForm && (
            <form onSubmit={handleAssignmentSubmit} className="mb-4 p-3 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Select Doctor *</label>
                  <select
                    required
                    value={assignmentFormData.doctor_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, doctor_id: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.users?.name} ({doctor.users?.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Select Pharmacy *</label>
                  <select
                    required
                    value={assignmentFormData.pharmacy_shop_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, pharmacy_shop_id: e.target.value })}
                    className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <option value="">Choose a pharmacy...</option>
                    {pharmacyShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                Create Assignment
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacy Shop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.doctors?.users?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.doctors?.users?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.pharmacy_shops?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
