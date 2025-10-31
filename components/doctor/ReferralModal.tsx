'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'
import { motion, AnimatePresence } from 'framer-motion'

type Doctor = {
  id: string
  specialization?: string
  users?: {
    name: string
    email: string
  }
}

type ReferralModalProps = {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  patientId: string
  currentDoctorId: string
  onSuccess: () => void
}

export default function ReferralModal({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  currentDoctorId,
  onSuccess
}: ReferralModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadDoctors()
    }
  }, [isOpen, currentDoctorId])

  const loadDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, specialization, users:user_id(name, email)')
      .neq('id', currentDoctorId) // Exclude current doctor
      .order('specialization')

    if (!error && data) {
      setDoctors(data as Doctor[])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedDoctorId) {
      setError('Please select a doctor')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for referral')
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          original_appointment_id: appointmentId,
          referring_doctor_id: currentDoctorId,
          referred_to_doctor_id: selectedDoctorId,
          patient_id: patientId,
          reason: reason.trim(),
          status: 'pending'
        })

      if (insertError) throw insertError

      // Reset form
      setSelectedDoctorId('')
      setReason('')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error creating referral:', err)
      setError('Failed to create referral. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedDoctorId('')
      setReason('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Icons.userPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Refer to Specialist</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Refer this patient to another doctor</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-10 h-10 rounded-lg bg-[var(--muted)] hover:bg-red-500/20 text-[var(--foreground)] hover:text-red-500 transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Icons.x className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <Icons.warning className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Doctor */}
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Select Specialist Doctor *
              </label>
              <div className="relative">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 appearance-none"
                  required
                >
                  <option value="">-- Choose a doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.users?.name} - {doctor.specialization || 'General'}
                    </option>
                  ))}
                </select>
                <Icons.chevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
              </div>
              {doctors.length === 0 && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Loading available doctors...
                </p>
              )}
            </div>

            {/* Referral Reason */}
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Reason for Referral *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                placeholder="Explain why you're referring this patient to a specialist..."
                rows={5}
                className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50"
                required
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Provide detailed medical reasons for this referral
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <Icons.info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-500 mb-1">How referrals work:</p>
                  <ul className="text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
                    <li>Your referral will be sent to the admin for review</li>
                    <li>Admin will approve or reject the referral</li>
                    <li>If approved, a new appointment will be created automatically</li>
                    <li>The patient will be notified about the referral</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDoctorId || !reason.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Icons.send className="w-5 h-5" />
                    <span>Submit Referral</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
