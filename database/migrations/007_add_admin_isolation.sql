-- Migration: Add admin-specific data isolation
-- This allows each admin to manage their own separate hospital

-- Add created_by_admin_id column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to users table (for staff, pharmacists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to referrals table (if exists)
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to rooms table (if exists)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to pharmacy_shops table (if exists)
ALTER TABLE pharmacy_shops ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add created_by_admin_id column to pharmacists table (if exists)
ALTER TABLE pharmacists ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_created_by_admin ON doctors(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_by_admin ON patients(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by_admin ON users(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by_admin ON appointments(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_by_admin ON referrals(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by_admin ON rooms(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_shops_created_by_admin ON pharmacy_shops(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_pharmacists_created_by_admin ON pharmacists(created_by_admin_id);

-- Add comments
COMMENT ON COLUMN doctors.created_by_admin_id IS 'Admin who created this doctor (for multi-hospital isolation)';
COMMENT ON COLUMN patients.created_by_admin_id IS 'Admin who created this patient (for multi-hospital isolation)';
COMMENT ON COLUMN users.created_by_admin_id IS 'Admin who created this user (for multi-hospital isolation)';
COMMENT ON COLUMN appointments.created_by_admin_id IS 'Admin who manages this appointment (for multi-hospital isolation)';
