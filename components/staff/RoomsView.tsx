'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'

type Room = {
  id: string
  room_number: string
  room_type: string
  floor: string
  description?: string
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  created_at: string
}

export default function RoomsView() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'general',
    floor: '',
    description: '',
    status: 'available' as 'available' | 'occupied' | 'maintenance' | 'reserved'
  })

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true })

    if (error) {
      console.error('Error loading rooms:', error)
    } else {
      setRooms(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRoom) {
      // Update existing room
      const { error } = await supabase
        .from('rooms')
        .update(formData)
        .eq('id', editingRoom.id)

      if (error) {
        console.error('Error updating room:', error)
        alert('Error updating room')
      } else {
        alert('Room updated successfully!')
      }
    } else {
      // Create new room
      const { error } = await supabase
        .from('rooms')
        .insert([formData])

      if (error) {
        console.error('Error creating room:', error)
        alert('Error creating room')
      } else {
        alert('Room created successfully!')
      }
    }

    setShowModal(false)
    setEditingRoom(null)
    resetForm()
    loadRooms()
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      floor: room.floor,
      description: room.description || '',
      status: room.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting room:', error)
      alert('Error deleting room')
    } else {
      alert('Room deleted successfully!')
      loadRooms()
    }
  }

  const resetForm = () => {
    setFormData({
      room_number: '',
      room_type: 'general',
      floor: '',
      description: '',
      status: 'available'
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

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'General Ward'
      case 'private': return 'Private Room'
      case 'icu': return 'ICU'
      case 'emergency': return 'Emergency'
      case 'surgery': return 'Surgery'
      default: return type
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.floor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesType = filterType === 'all' || room.room_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Room Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage hospital rooms and their availability</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingRoom(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold text-sm shadow-md"
        >
          <Icons.plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Search</label>
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by room number or floor..."
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

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Room Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
            >
              <option value="all">All Types</option>
              <option value="general">General Ward</option>
              <option value="private">Private Room</option>
              <option value="icu">ICU</option>
              <option value="emergency">Emergency</option>
              <option value="surgery">Surgery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Room {room.room_number}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Floor {room.floor}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Icons.building className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--foreground)]">{getRoomTypeLabel(room.room_type)}</span>
                </div>
                {room.description && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{room.description}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => handleEdit(room)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                >
                  <Icons.edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
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

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl">
          <Icons.building className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
          <p className="text-[var(--muted-foreground)]">No rooms found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Room Number *</label>
                <input
                  type="text"
                  required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Room Type *</label>
                <select
                  required
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="general">General Ward</option>
                  <option value="private">Private Room</option>
                  <option value="icu">ICU</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Floor *</label>
                <input
                  type="text"
                  required
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="e.g., 1"
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

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRoom(null)
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
                  {editingRoom ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
