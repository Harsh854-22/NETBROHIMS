'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createUser } from '@/lib/auth'
import { Icons } from '@/components/Icons'

type PharmacyShop = {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  license_number?: string
}

type Pharmacist = {
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
}

type Doctor = {
  id: string
  users?: {
    id: string
    name: string
    email: string
  }
}

type Assignment = {
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
}

export default function PharmacistsView() {
  const [pharmacyShops, setPharmacyShops] = useState<PharmacyShop[]>([])
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
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
  const [assignments, setAssignments] = useState<Assignment[]>([])

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
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Icons.pill className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Pharmacist & Pharmacy Management</h2>
      </div>

      {/* Sub-tabs */}
      <div className="mb-6 border-b-2 border-[var(--border)]">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('shops')}
            className={`pb-3 px-4 font-semibold text-sm transition-all ${
              activeTab === 'shops' 
                ? 'border-b-2 border-green-500 text-[var(--foreground)] bg-gradient-to-t from-green-500/10' 
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icons.hospital className="w-4 h-4" />
              Pharmacy Shops
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pharmacists')}
            className={`pb-3 px-4 font-semibold text-sm transition-all ${
              activeTab === 'pharmacists' 
                ? 'border-b-2 border-green-500 text-[var(--foreground)] bg-gradient-to-t from-green-500/10' 
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icons.pill className="w-4 h-4" />
              Pharmacists
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-4 font-semibold text-sm transition-all ${
              activeTab === 'assignments' 
                ? 'border-b-2 border-green-500 text-[var(--foreground)] bg-gradient-to-t from-green-500/10' 
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icons.link className="w-4 h-4" />
              Doctor-Pharmacy Links
            </div>
          </button>
        </nav>
      </div>

      {/* Pharmacy Shops Tab */}
      {activeTab === 'shops' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Pharmacy Shops ({pharmacyShops.length})</h3>
            <button
              onClick={() => setShowShopForm(!showShopForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-105 ${
                showShopForm 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              }`}
            >
              {showShopForm ? (
                <>
                  <Icons.x className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Icons.plus className="w-4 h-4" />
                  Add Pharmacy Shop
                </>
              )}
            </button>
          </div>

          {showShopForm && (
            <form onSubmit={handleShopSubmit} className="mb-6 p-6 border-2 border-[var(--border)] bg-[var(--muted)]/30 rounded-xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Icons.hospital className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">New Pharmacy Shop</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={shopFormData.name}
                    onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="Green Cross Pharmacy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email</label>
                  <input
                    type="email"
                    value={shopFormData.email}
                    onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="pharmacy@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={shopFormData.phone}
                    onChange={(e) => setShopFormData({ ...shopFormData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">License Number</label>
                  <input
                    type="text"
                    value={shopFormData.license_number}
                    onChange={(e) => setShopFormData({ ...shopFormData, license_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="PH-12345"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Address</label>
                  <textarea
                    value={shopFormData.address}
                    onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all resize-none"
                    rows={2}
                    placeholder="Street, City, State, ZIP"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.check className="w-4 h-4" />
                Create Pharmacy Shop
              </button>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg border-2 border-[var(--border)]">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">License</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {pharmacyShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-[var(--accent)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Icons.hospital className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground)]">{shop.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] max-w-xs truncate">{shop.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{shop.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{shop.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium">{shop.license_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteShop(shop.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs"
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
      )}

      {/* Pharmacists Tab */}
      {activeTab === 'pharmacists' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Pharmacists ({pharmacists.length})</h3>
            <button
              onClick={() => setShowPharmacistForm(!showPharmacistForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-105 ${
                showPharmacistForm 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              }`}
            >
              {showPharmacistForm ? (
                <>
                  <Icons.x className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Icons.plus className="w-4 h-4" />
                  Add Pharmacist
                </>
              )}
            </button>
          </div>

          {showPharmacistForm && (
            <form onSubmit={handlePharmacistSubmit} className="mb-6 p-6 border-2 border-[var(--border)] bg-[var(--muted)]/30 rounded-xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Icons.userCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">New Pharmacist</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={pharmacistFormData.name}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={pharmacistFormData.email}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="pharmacist@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={pharmacistFormData.phone}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={pharmacistFormData.password}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Assign to Pharmacy</label>
                  <select
                    value={pharmacistFormData.pharmacy_shop_id}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, pharmacy_shop_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  >
                    <option value="">Select Pharmacy (Optional)</option>
                    {pharmacyShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">License Number</label>
                  <input
                    type="text"
                    value={pharmacistFormData.license_number}
                    onChange={(e) => setPharmacistFormData({ ...pharmacistFormData, license_number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                    placeholder="RPH-12345"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.check className="w-4 h-4" />
                Create Pharmacist
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Pharmacy</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">License</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {pharmacists.map((pharmacist) => (
                  <tr key={pharmacist.id} className="hover:bg-[var(--accent)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Icons.user className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground)]">{pharmacist.users?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{pharmacist.users?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{pharmacist.users?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium">{pharmacist.pharmacy_shops?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] font-medium">{pharmacist.license_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeletePharmacist(pharmacist.id, pharmacist.users?.id || '')}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs"
                        disabled={!pharmacist.users?.id}
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
      )}

      {/* Doctor-Pharmacy Assignments Tab */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Doctor-Pharmacy Assignments ({assignments.length})</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Link doctors to pharmacies so prescriptions are auto-sent</p>
            </div>
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-105 whitespace-nowrap ${
                showAssignmentForm 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              }`}
            >
              {showAssignmentForm ? (
                <>
                  <Icons.x className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Icons.link className="w-4 h-4" />
                  Link Doctor to Pharmacy
                </>
              )}
            </button>
          </div>

          {showAssignmentForm && (
            <form onSubmit={handleAssignmentSubmit} className="mb-6 p-6 border-2 border-[var(--border)] bg-[var(--muted)]/30 rounded-xl space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Icons.link className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Create Doctor-Pharmacy Link</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Select Doctor *</label>
                  <select
                    required
                    value={assignmentFormData.doctor_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, doctor_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.users?.name} ({doctor.users?.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Select Pharmacy *</label>
                  <select
                    required
                    value={assignmentFormData.pharmacy_shop_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, pharmacy_shop_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--input)] border-2 border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  >
                    <option value="">Choose a pharmacy...</option>
                    {pharmacyShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
              >
                <Icons.check className="w-4 h-4" />
                Create Assignment
              </button>
            </form>
          )}

          <div className="overflow-x-auto rounded-lg border-2 border-[var(--border)]">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Doctor Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Pharmacy Shop</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-[var(--accent)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] flex items-center justify-center">
                          <Icons.stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground)]">Dr. {assignment.doctors?.users?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">{assignment.doctors?.users?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Icons.hospital className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground)]">{assignment.pharmacy_shops?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-xs"
                      >
                        <Icons.trash className="w-3.5 h-3.5" />
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
