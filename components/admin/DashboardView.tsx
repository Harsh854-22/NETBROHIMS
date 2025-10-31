'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/Icons'

export default function DashboardView() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
      supabase.from('doctors').select('id', { count: 'exact', head: true }),
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true })
    ])

    setStats({
      doctors: doctorsRes.count || 0,
      patients: patientsRes.count || 0,
      appointments: appointmentsRes.count || 0
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Doctors Card - Uses theme gradient */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-l-[var(--gradient-from)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">Total Doctors</p>
            <p className="text-4xl font-bold text-[var(--gradient-from)]">{stats.doctors}</p>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] shadow-lg">
            <Icons.stethoscope className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      {/* Patients Card - Uses theme gradient middle color */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-l-[var(--gradient-via)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">Total Patients</p>
            <p className="text-4xl font-bold text-[var(--gradient-via)]">{stats.patients}</p>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--gradient-via)] to-[var(--gradient-to)] shadow-lg">
            <Icons.users className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      {/* Appointments Card - Uses theme gradient end color */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-l-[var(--gradient-to)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">Total Appointments</p>
            <p className="text-4xl font-bold text-[var(--gradient-to)]">{stats.appointments}</p>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--gradient-to)] to-[var(--gradient-from)] shadow-lg">
            <Icons.calendar className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
