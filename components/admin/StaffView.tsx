'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createUser } from '@/lib/auth'
import { Icons } from '@/components/Icons'

type Staff = {
  id: string
  name: string
  email: string
  phone?: string
  created_at: string
}

export default function StaffView() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'staff')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading staff:', error)
    } else {
      setStaff(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newUser = await createUser(
      formData.email,
      formData.name,
      'staff',
      formData.password,
      formData.phone
    )

    if (newUser) {
      alert('Staff member created successfully!')
      setShowModal(false)
      resetForm()
      loadStaff()
    } else {
      alert('Error creating staff member')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting staff:', error)
      alert('Error deleting staff member')
    } else {
      alert('Staff member deleted successfully!')
      loadStaff()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    })
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Staff Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage hospital staff members</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
        >
          <Icons.plus className="w-4 h-4" />
          Add Staff Member
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

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] flex items-center justify-center text-white font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{member.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{member.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                    <Icons.phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icons.clipboard className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--foreground)]">Staff Member</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => handleDelete(member.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
                >
                  <Icons.trash className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredStaff.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl">
          <Icons.clipboard className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No staff members found</p>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full shadow-2xl border-2 border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">Add New Staff Member</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="Staff member's full name"
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
                  placeholder="staff@example.com"
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
                  placeholder="Create a secure password"
                  minLength={6}
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
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
