-- Migration: Update users table to support pharmacist role
-- This must be run BEFORE 003_add_pharmacist_system.sql

-- Drop the existing role check constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new role check constraint that includes pharmacist
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'doctor', 'patient', 'pharmacist'));

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: admin, doctor, patient, or pharmacist';
