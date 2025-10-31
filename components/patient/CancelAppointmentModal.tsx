'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'
import { motion, AnimatePresence } from 'framer-motion'

type CancelAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  doctorName?: string
  userId: string
  onSuccess: () => void
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  appointmentId,
  appointmentDate,
  appointmentTime,
  doctorName,
  userId,
  onSuccess
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = async () => {
    setError('')
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId,
          cancellation_reason: reason.trim() || 'No reason provided'
        })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      // Reset form
      setReason('')
      setShowConfirm(false)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setError('Failed to cancel appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setError('')
      setShowConfirm(false)
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
          className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-2xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {!showConfirm ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Icons.x className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">Cancel Appointment</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Are you sure you want to cancel?</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="w-10 h-10 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-all flex items-center justify-center disabled:opacity-50"
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

              {/* Appointment Details */}
              <div className="mb-6 p-4 bg-[var(--muted)] rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Icons.calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="font-semibold text-[var(--foreground)]">Date:</span>
                  <span className="text-[var(--foreground)]">{appointmentDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="font-semibold text-[var(--foreground)]">Time:</span>
                  <span className="text-[var(--foreground)]">{appointmentTime}</span>
                </div>
                {doctorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.stethoscope className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="font-semibold text-[var(--foreground)]">Doctor:</span>
                    <span className="text-[var(--foreground)]">Dr. {doctorName}</span>
                  </div>
                )}
              </div>

              {/* Cancellation Reason */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  placeholder="Let us know why you're cancelling..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  This helps us improve our service
                </p>
              </div>

              {/* Warning Box */}
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <Icons.warning className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Important:</p>
                    <p className="text-[var(--muted-foreground)]">
                      Once cancelled, you'll need to contact the hospital admin to schedule a new appointment.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Icons.x className="w-5 h-5" />
                  <span>Cancel Appointment</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Screen */}
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icons.warning className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  This will permanently cancel your appointment scheduled for <strong>{appointmentDate}</strong> at <strong>{appointmentTime}</strong>.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold transition-all disabled:opacity-50"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <Icons.check className="w-5 h-5" />
                        <span>Yes, Cancel It</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
