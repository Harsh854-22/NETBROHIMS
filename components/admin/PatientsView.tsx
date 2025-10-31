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
  users?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

type PatientsViewProps = {
  currentUserId: string
}

export default function PatientsView({ currentUserId }: PatientsViewProps) {
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
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Icons.users className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">Patients Management</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-105 ${
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
              Add Patient
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-[var(--border)] bg-[var(--muted)]/30 rounded-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--border)]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Icons.userCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">New Patient Registration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                rows={2}
                placeholder="Street, City, State, ZIP"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Medical History</label>
              <textarea
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Previous conditions, allergies, current medications..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md min-w-fit whitespace-nowrap"
          >
            <Icons.check className="w-4 h-4" />
            Create Patient Account
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border-2 border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--muted)]/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Date of Birth</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-[var(--accent)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Icons.user className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{patient.users?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{patient.users?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{patient.users?.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium capitalize">{patient.gender || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{patient.date_of_birth || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeletePatient(patient.id, patient.users?.id || '')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs min-w-fit whitespace-nowrap"
                    disabled={!patient.users?.id}
                  >
                    <Icons.trash className="w-3.5 h-3.5" />
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
