-- Migration: Add superadmin role

-- Update role check constraint to include superadmin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('superadmin', 'admin', 'doctor', 'patient', 'pharmacist', 'staff'));

-- Update comment
COMMENT ON COLUMN users.role IS 'User role: superadmin, admin, doctor, patient, pharmacist, or staff';

-- Create your superadmin account
-- Password: SuperAdmin@123 (CHANGE THIS AFTER FIRST LOGIN!)
-- Note: If this INSERT fails, the account may already exist. Use the verify-superadmin.js script.
DELETE FROM users WHERE email = 'harshsingh050607@gmail.com';

INSERT INTO users (email, name, role, phone, password_hash)
VALUES (
  'harshsingh050607@gmail.com',
  'Super Administrator',
  'superadmin',
  '+91 7021478704',
  '$2b$10$qG1dPVFYyxfoQgiGuEq9mun6KzdRXrvKfCOQEPBKq3TdfupNmcJNy'
);

-- Add comment explaining superadmin
COMMENT ON TABLE users IS 'System users with roles: superadmin (creates admins), admin (creates doctors/patients/staff), doctor, patient, pharmacist, staff';
