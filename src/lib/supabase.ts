import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'doctor' | 'patient'
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'doctor' | 'patient'
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'doctor' | 'patient'
          phone?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          date_of_birth?: string
          gender?: string
          address?: string
          medical_history?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string
          gender?: string
          address?: string
          medical_history?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string
          gender?: string
          address?: string
          medical_history?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          specialization?: string
          qualification?: string
          experience_years?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization?: string
          qualification?: string
          experience_years?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string
          qualification?: string
          experience_years?: number
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'accepted' | 'rejected' | 'rescheduled' | 'completed'
          reason?: string
          notes?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'accepted' | 'rejected' | 'rescheduled' | 'completed'
          reason?: string
          notes?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'rescheduled' | 'completed'
          reason?: string
          notes?: string
          updated_at?: string
        }
      }
    }
  }
}
