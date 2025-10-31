-- Migration: Add staff role and rooms/beds management system

-- Update role check constraint to include staff
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'doctor', 'patient', 'pharmacist', 'staff'));

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: admin, doctor, patient, pharmacist, or staff';

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_type VARCHAR(50) NOT NULL, -- 'general', 'private', 'icu', 'emergency', 'surgery'
  floor VARCHAR(10),
  description TEXT,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'reserved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'reserved'
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP WITH TIME ZONE,
  discharge_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, bed_number)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_patient_id ON beds(patient_id);

-- Create trigger to update updated_at timestamp for rooms
CREATE OR REPLACE FUNCTION update_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_rooms_updated_at();

-- Create trigger to update updated_at timestamp for beds
CREATE OR REPLACE FUNCTION update_beds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_beds_updated_at
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION update_beds_updated_at();

-- Add some sample rooms (optional - can be removed if not needed)
INSERT INTO rooms (room_number, room_type, floor, description, status) VALUES
  ('101', 'general', '1', 'General Ward Room 101', 'available'),
  ('102', 'general', '1', 'General Ward Room 102', 'available'),
  ('201', 'private', '2', 'Private Room 201', 'available'),
  ('202', 'private', '2', 'Private Room 202', 'available'),
  ('301', 'icu', '3', 'ICU Room 301', 'available'),
  ('302', 'icu', '3', 'ICU Room 302', 'available'),
  ('401', 'emergency', '4', 'Emergency Room 401', 'available'),
  ('501', 'surgery', '5', 'Surgery Room 501', 'available')
ON CONFLICT (room_number) DO NOTHING;

-- Add comments
COMMENT ON TABLE rooms IS 'Hospital rooms management';
COMMENT ON TABLE beds IS 'Hospital beds management within rooms';
COMMENT ON COLUMN rooms.status IS 'Room status: available, occupied, maintenance, or reserved';
COMMENT ON COLUMN beds.status IS 'Bed status: available, occupied, maintenance, or reserved';
