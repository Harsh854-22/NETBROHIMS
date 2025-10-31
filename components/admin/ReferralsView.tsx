'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'
import { motion, AnimatePresence } from 'framer-motion'

type Referral = {
  id: string
  original_appointment_id: string
  referring_doctor_id: string
  referred_to_doctor_id: string
  patient_id: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  new_appointment_id?: string
  reviewed_at?: string
  created_at: string
  referring_doctor?: {
    users?: {
      name: string
      email: string
    }
    specialization?: string
  }
  referred_to_doctor?: {
    users?: {
      name: string
      email: string
    }
    specialization?: string
  }
  patient?: {
    users?: {
      name: string
      email: string
    }
  }
  original_appointment?: {
    appointment_date: string
    appointment_time: string
    reason?: string
  }
}

type Notification = {
  text: string
  type: 'success' | 'error' | 'info'
}

type ReferralsViewProps = {
  currentUserId: string
}

export default function ReferralsView({ currentUserId }: ReferralsViewProps) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const showMessage = useCallback((text: string, type: Notification['type']) => {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const loadReferrals = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('referrals')
      .select(`
        *,
        referring_doctor:referring_doctor_id (
          id,
          users:user_id (name, email),
          specialization
        ),
        referred_to_doctor:referred_to_doctor_id (
          id,
          users:user_id (name, email),
          specialization
        ),
        patient:patient_id (
          id,
          users:user_id (name, email)
        ),
        original_appointment:original_appointment_id (
          appointment_date,
          appointment_time,
          reason
        )
      `)
      .eq('created_by_admin_id', currentUserId) // Filter by current admin
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setReferrals(data as Referral[])
    }
    setLoading(false)
  }, [filter, currentUserId])

  useEffect(() => {
    loadReferrals()
  }, [loadReferrals])

  const handleApprove = async (referral: Referral) => {
    setProcessingId(referral.id)
    
    try {
      // Create new appointment with referred doctor
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: referral.patient_id,
          doctor_id: referral.referred_to_doctor_id,
          appointment_date: referral.original_appointment?.appointment_date,
          appointment_time: referral.original_appointment?.appointment_time,
          status: 'pending',
          reason: `Referral from Dr. ${referral.referring_doctor?.users?.name} - ${referral.reason}`,
          created_by: referral.patient_id // Using patient_id as creator
        })
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // Update referral status
      const { error: referralError } = await supabase
        .from('referrals')
        .update({
          status: 'approved',
          new_appointment_id: newAppointment.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', referral.id)

      if (referralError) throw referralError

      // Mark original appointment as completed
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', referral.original_appointment_id)

      showMessage('Referral approved and new appointment created!', 'success')
      loadReferrals()
    } catch (error) {
      console.error('Error approving referral:', error)
      showMessage('Failed to approve referral', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (referralId: string) => {
    setProcessingId(referralId)
    
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', referralId)

      if (error) throw error

      showMessage('Referral rejected', 'info')
      loadReferrals()
    } catch (error) {
      console.error('Error rejecting referral:', error)
      showMessage('Failed to reject referral', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/40'
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/40'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40'
    }
  }

  const filteredReferrals = referrals.filter(ref => {
    if (filter === 'all') return true
    return ref.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm ${
              notification.type === 'success' ? 'bg-green-600/80 text-white' :
              notification.type === 'error' ? 'bg-red-600/80 text-white' :
              'bg-blue-600/80 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <Icons.check className="w-5 h-5" />}
              {notification.type === 'error' && <Icons.x className="w-5 h-5" />}
              <span className="font-semibold">{notification.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Icons.userPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Doctor Referrals
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm">Manage patient referrals between doctors</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-6 shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="ml-4 text-[var(--muted-foreground)] font-medium">Loading referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="text-center py-20">
            <Icons.userPlus className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
            <p className="text-xl font-semibold text-[var(--foreground)]">No referrals found</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              {filter === 'pending' ? 'No pending referrals to review' : `No ${filter} referrals`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReferrals.map((referral) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--muted)] border-2 border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Referral Info */}
                  <div className="flex-1 space-y-4">
                    {/* Patient Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0">
                        <Icons.user className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Patient</p>
                        <p className="font-bold text-[var(--foreground)]">{referral.patient?.users?.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{referral.patient?.users?.email}</p>
                      </div>
                    </div>

                    {/* Referring Doctor */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                        <Icons.stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Referring Doctor</p>
                        <p className="font-bold text-[var(--foreground)]">Dr. {referral.referring_doctor?.users?.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{referral.referring_doctor?.specialization}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 pl-12">
                      <Icons.arrowRight className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-500">Referring to</span>
                    </div>

                    {/* Referred To Doctor */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                        <Icons.stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Referred To</p>
                        <p className="font-bold text-[var(--foreground)]">Dr. {referral.referred_to_doctor?.users?.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{referral.referred_to_doctor?.specialization}</p>
                      </div>
                    </div>

                    {/* Referral Reason */}
                    <div className="pl-12 pt-2 border-l-2 border-purple-500/30">
                      <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-1">Referral Reason</p>
                      <p className="text-[var(--foreground)]">{referral.reason}</p>
                    </div>

                    {/* Original Appointment Info */}
                    <div className="pl-12 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2">
                        <Icons.calendar className="w-4 h-4" />
                        {referral.original_appointment?.appointment_date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.clock className="w-4 h-4" />
                        {referral.original_appointment?.appointment_time}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-4 min-w-[200px]">
                    <span className={`px-4 py-2 text-xs font-bold rounded-full border ${getStatusColor(referral.status)}`}>
                      {referral.status.toUpperCase()}
                    </span>

                    {referral.status === 'pending' && (
                      <div className="flex flex-col gap-2 w-full">
                        <button
                          onClick={() => handleApprove(referral)}
                          disabled={processingId === referral.id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                        >
                          <Icons.check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(referral.id)}
                          disabled={processingId === referral.id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                        >
                          <Icons.x className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-[var(--muted-foreground)] text-right">
                      Created: {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                    {referral.reviewed_at && (
                      <p className="text-xs text-[var(--muted-foreground)] text-right">
                        Reviewed: {new Date(referral.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
