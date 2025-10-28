-- Add notes and prescription columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_completed_at ON appointments(completed_at);
