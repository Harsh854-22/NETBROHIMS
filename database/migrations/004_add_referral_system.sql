-- Add referral system to support doctor referrals and appointment cancellations

-- Add cancelled status to appointments
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled', 'completed', 'cancelled'));

-- Add cancellation tracking columns
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  referring_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  referred_to_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  new_appointment_id UUID REFERENCES appointments(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor ON referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_to_doctor ON referrals(referred_to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_original_appointment ON referrals(original_appointment_id);

-- Add trigger for referrals updated_at
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE referrals IS 'Stores doctor referrals where one doctor refers a patient to another specialist';
COMMENT ON COLUMN referrals.status IS 'pending: awaiting admin approval, approved: admin approved and new appointment created, rejected: admin rejected the referral';
COMMENT ON COLUMN appointments.cancelled_by IS 'User ID who cancelled the appointment (patient or admin)';
