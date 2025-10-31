'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'

type Bed = {
  id: string
  room_id: string
  bed_number: string
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  patient_id?: string
  assigned_date?: string
  discharge_date?: string
  notes?: string
  rooms?: {
    room_number: string
    room_type: string
    floor: string
  }
  patients?: {
    id: string
    users?: {
      name: string
      phone?: string
    }
  }
}

type Room = {
  id: string
  room_number: string
}

type Patient = {
  id: string
  users?: {
    name: string
    phone?: string
  }
}

export default function BedsView() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBed, setEditingBed] = useState<Bed | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState({
    room_id: '',
    bed_number: '',
    status: 'available' as 'available' | 'occupied' | 'maintenance' | 'reserved',
    patient_id: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load beds with room and patient info
    const { data: bedsData, error: bedsError } = await supabase
      .from('beds')
      .select(`
        *,
        rooms!inner(room_number, room_type, floor),
        patients(id, users:user_id(name, phone))
      `)
      .order('created_at', { ascending: false })

    // Load rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, room_number')
      .order('room_number')

    // Load patients
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select(`
        id,
        users:user_id!inner(name, phone)
      `)
      .order('created_at', { ascending: false })

    if (bedsError) {
      console.error('Error loading beds:', bedsError)
      if (bedsError.message?.includes('relation') || bedsError.code === '42P01') {
        alert('⚠️ Database tables not found!\n\nPlease run the migration:\n1. Open Supabase Dashboard\n2. Go to SQL Editor\n3. Run: database/migrations/005_add_staff_and_rooms_system.sql')
      }
    } else {
      setBeds(bedsData || [])
    }

    if (roomsError) {
      console.error('Error loading rooms:', roomsError)
    } else {
      setRooms(roomsData || [])
    }

    if (patientsError) {
      console.error('Error loading patients:', patientsError)
    } else {
      setPatients(patientsData || [])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: {
      room_id: string
      bed_number: string
      status: string
      notes: string | null
      patient_id?: string | null
      assigned_date?: string | null
      discharge_date?: string | null
    } = {
      room_id: formData.room_id,
      bed_number: formData.bed_number,
      status: formData.status,
      notes: formData.notes || null
    }

    // Only set patient_id if status is occupied
    if (formData.status === 'occupied' && formData.patient_id) {
      submitData.patient_id = formData.patient_id
      submitData.assigned_date = new Date().toISOString()
    } else {
      submitData.patient_id = null
      submitData.assigned_date = null
      submitData.discharge_date = null
    }

    if (editingBed) {
      // Update existing bed
      const { error } = await supabase
        .from('beds')
        .update(submitData)
        .eq('id', editingBed.id)

      if (error) {
        console.error('Error updating bed:', error)
        alert('Error updating bed')
      } else {
        alert('Bed updated successfully!')
      }
    } else {
      // Create new bed
      const { error } = await supabase
        .from('beds')
        .insert([submitData])

      if (error) {
        console.error('Error creating bed:', error)
        alert('Error creating bed')
      } else {
        alert('Bed created successfully!')
      }
    }

    setShowModal(false)
    setEditingBed(null)
    resetForm()
    loadData()
  }

  const handleEdit = (bed: Bed) => {
    setEditingBed(bed)
    setFormData({
      room_id: bed.room_id,
      bed_number: bed.bed_number,
      status: bed.status,
      patient_id: bed.patient_id || '',
      notes: bed.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bed?')) return

    const { error } = await supabase
      .from('beds')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bed:', error)
      alert('Error deleting bed')
    } else {
      alert('Bed deleted successfully!')
      loadData()
    }
  }

  const resetForm = () => {
    setFormData({
      room_id: '',
      bed_number: '',
      status: 'available',
      patient_id: '',
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'occupied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'reserved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bed_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.rooms?.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.patients?.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Bed Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage hospital beds and patient assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingBed(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
        >
          <Icons.plus className="w-4 h-4" />
          Add Bed
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Search</label>
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by bed, room number, or patient..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeds.map((bed) => (
            <div key={bed.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Bed {bed.bed_number}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Room {bed.rooms?.room_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bed.status)}`}>
                  {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Icons.building className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--foreground)]">Floor {bed.rooms?.floor}</span>
                </div>
                {bed.patients?.users && (
                  <div className="flex items-center gap-2">
                    <Icons.user className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-sm text-[var(--foreground)]">{bed.patients.users.name}</span>
                  </div>
                )}
                {bed.notes && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{bed.notes}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => handleEdit(bed)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                >
                  <Icons.edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bed.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
                >
                  <Icons.trash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredBeds.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl">
          <Icons.bed className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No beds found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">
              {editingBed ? 'Edit Bed' : 'Add New Bed'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Room *</label>
                <select
                  required
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>Room {room.room_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Bed Number *</label>
                <input
                  type="text"
                  required
                  value={formData.bed_number}
                  onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="e.g., A1, B2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'maintenance' | 'reserved' })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              {formData.status === 'occupied' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Assign Patient *</label>
                  <select
                    required={formData.status === 'occupied'}
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
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingBed(null)
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
                  {editingBed ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
