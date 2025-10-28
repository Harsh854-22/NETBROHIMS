-- Migration: Add Pharmacist and Pharmacy Shop System
-- This creates tables for pharmacy shops, pharmacists, and doctor-pharmacy assignments

-- Create pharmacy_shops table
CREATE TABLE IF NOT EXISTS pharmacy_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  license_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pharmacists table
CREATE TABLE IF NOT EXISTS pharmacists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_shop_id UUID REFERENCES pharmacy_shops(id) ON DELETE SET NULL,
  license_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create doctor_pharmacy_assignments table (links doctors to pharmacy shops)
CREATE TABLE IF NOT EXISTS doctor_pharmacy_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  pharmacy_shop_id UUID REFERENCES pharmacy_shops(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doctor_id, pharmacy_shop_id)
);

-- Create prescription_queue table (prescriptions sent to pharmacist)
CREATE TABLE IF NOT EXISTS prescription_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  pharmacy_shop_id UUID REFERENCES pharmacy_shops(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  prescription TEXT NOT NULL,
  doctor_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, dispensed, cancelled
  dispensed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacists_user_id ON pharmacists(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacists_pharmacy_shop_id ON pharmacists(pharmacy_shop_id);
CREATE INDEX IF NOT EXISTS idx_doctor_pharmacy_doctor_id ON doctor_pharmacy_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_pharmacy_shop_id ON doctor_pharmacy_assignments(pharmacy_shop_id);
CREATE INDEX IF NOT EXISTS idx_prescription_queue_status ON prescription_queue(status);
CREATE INDEX IF NOT EXISTS idx_prescription_queue_pharmacy_shop ON prescription_queue(pharmacy_shop_id);
CREATE INDEX IF NOT EXISTS idx_prescription_queue_created_at ON prescription_queue(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE pharmacy_shops IS 'Stores pharmacy shop information';
COMMENT ON TABLE pharmacists IS 'Stores pharmacist profiles linked to users and pharmacy shops';
COMMENT ON TABLE doctor_pharmacy_assignments IS 'Links doctors to pharmacy shops for prescription routing';
COMMENT ON TABLE prescription_queue IS 'Queue of prescriptions to be dispensed by pharmacists';
