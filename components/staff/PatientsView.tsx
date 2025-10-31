'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createUser } from '@/lib/auth'
import { Icons } from '@/components/Icons'

type Patient = {
  id: string
  user_id: string
  date_of_birth?: string
  gender?: string
  address?: string
  medical_history?: string
  created_at: string
  users?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

export default function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
    setLoading(true)
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users:user_id (id, name, email, phone)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading patients:', error)
    } else {
      setPatients(data || [])
    }
    setLoading(false)
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
      console.error('Error creating patient profile:', error)
      alert('Error creating patient profile')
      return
    }

    alert('Patient created successfully!')
    setShowModal(false)
    resetForm()
    loadPatients()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      date_of_birth: '',
      gender: '',
      address: '',
      medical_history: ''
    })
  }

  const filteredPatients = patients.filter(patient => {
    if (!patient || !patient.users) return false
    const matchesSearch = patient.users.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.users.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.users.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Patient Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Register new patients</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
        >
          <Icons.plus className="w-4 h-4" />
          Add Patient
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
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] flex items-center justify-center text-white font-bold text-lg">
                  {patient.users?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{patient.users?.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{patient.users?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {patient.users?.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                    <Icons.phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span>{patient.users.phone}</span>
                  </div>
                )}
                {patient.date_of_birth && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                    <Icons.calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {patient.address && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{patient.address}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl">
          <Icons.users className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No patients found</p>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">Add New Patient</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="Patient's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="patient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="Set a secure password"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  rows={2}
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Medical History</label>
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  rows={3}
                  placeholder="Any relevant medical history"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
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
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
