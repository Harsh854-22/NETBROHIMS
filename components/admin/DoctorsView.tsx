'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createUser } from '@/lib/auth'
import { Icons } from '@/components/Icons'

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

type DoctorsViewProps = {
  currentUserId: string
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function DoctorsView({ currentUserId, searchTerm, setSearchTerm }: DoctorsViewProps) {
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
  }, [currentUserId])

  const loadDoctors = async () => {
    // Filter doctors by current admin - each admin sees only their own doctors
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users:user_id (id, name, email, phone)
      `)
      .eq('created_by_admin_id', currentUserId)

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
    const result = await createUser(formData.email, formData.password, 'doctor', formData.name, formData.phone)
    
    if (!result.success || !result.user) {
      alert(result.message || 'Error creating doctor user')
      return
    }

    // Create doctor profile with admin tracking
    const { error } = await supabase.from('doctors').insert({
      user_id: result.user.id,
      specialization: formData.specialization,
      qualification: formData.qualification,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      created_by_admin_id: currentUserId // Track which admin created this doctor
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
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Doctors Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md whitespace-nowrap"
          >
            {showForm ? (
              <>
                <Icons.x className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Icons.plus className="w-4 h-4" />
                Add Doctor
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 border-2 border-[var(--border)] rounded-xl bg-[var(--muted)]/20 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Icons.userCircle className="w-5 h-5" />
            Add New Doctor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="Dr. John Doe"
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
                placeholder="doctor@hospital.com"
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
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="e.g., Cardiology"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="e.g., MBBS, MD"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Years of Experience</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                placeholder="e.g., 5"
                min="0"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md min-w-fit whitespace-nowrap"
          >
            <Icons.check className="w-4 h-4" />
            Create Doctor Account
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
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Experience</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
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
              <tr key={doctor.id} className="hover:bg-[var(--accent)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
                      <Icons.user className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{doctor.users?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{doctor.users?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{doctor.users?.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium">{doctor.specialization || 'General'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{doctor.experience_years} years</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.users?.id || '')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs min-w-fit whitespace-nowrap"
                    disabled={!doctor.users?.id}
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
