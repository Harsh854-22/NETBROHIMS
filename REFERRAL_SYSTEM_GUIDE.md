# Referral System & Appointment Cancellation Implementation Guide

## 🎯 Features Overview

### 1. Doctor Referral System
- Doctors can refer patients to other specialists
- Admin reviews and approves/rejects referrals
- New appointments are automatically created upon approval

### 2. Patient Appointment Cancellation
- Patients can cancel their upcoming appointments
- Cancellation is tracked with timestamp and reason
- Cancelled appointments are clearly marked

---

## 📋 Prerequisites (What You Need to Do)

### Step 1: Run Database Migration
You need to run the SQL migration to add new tables and columns to your database.

**Instructions:**
1. Open your Supabase Dashboard (https://supabase.com)
2. Navigate to your project
3. Go to **SQL Editor** (left sidebar)
4. Copy the contents of `database/migrations/004_add_referral_system.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

**What this does:**
- Adds 'cancelled' status to appointments
- Creates a new `referrals` table
- Adds cancellation tracking fields to appointments

### Step 2: Verify Migration Success
After running the migration, check:
- Go to **Table Editor** in Supabase
- You should see a new table called `referrals`
- In the `appointments` table, you should see new columns: `cancelled_at`, `cancelled_by`, `cancellation_reason`

---

## 🔧 Implementation Details

### Database Schema Changes

#### Referrals Table Structure:
```sql
referrals
├── id (UUID, Primary Key)
├── original_appointment_id (References appointments)
├── referring_doctor_id (References doctors)
├── referred_to_doctor_id (References doctors)
├── patient_id (References patients)
├── reason (Text - why the referral)
├── status (pending/approved/rejected)
├── new_appointment_id (References new appointment created)
├── reviewed_by (Admin who reviewed)
├── reviewed_at (Timestamp)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

#### Appointments Table - New Columns:
- `cancelled_at` - When the appointment was cancelled
- `cancelled_by` - Who cancelled it (patient or admin)
- `cancellation_reason` - Why it was cancelled
- `status` - Now includes 'cancelled' option

---

## 🚀 How to Use the Features

### For Doctors:
1. Open an appointment card
2. Click "Refer to Specialist" button
3. Select the specialist doctor from dropdown
4. Enter referral reason
5. Submit - Admin will be notified

### For Admins:
1. Go to "Referrals" tab in admin dashboard
2. View pending referrals
3. Approve or reject each referral
4. When approved:
   - New appointment is automatically created
   - Original appointment is marked as completed
   - Patient and new doctor are notified

### For Patients:
1. View your appointments
2. Click "Cancel Appointment" button
3. Enter cancellation reason (optional)
4. Confirm cancellation
5. Appointment status changes to "cancelled"

---

## 📁 Files Created/Modified

### New Files:
1. `database/migrations/004_add_referral_system.sql` - Database migration
2. `components/admin/ReferralsView.tsx` - Admin referral management
3. `components/doctor/ReferralModal.tsx` - Doctor referral form
4. `components/patient/CancelAppointmentModal.tsx` - Patient cancellation

### Modified Files:
1. `app/doctor/page.tsx` - Added referral button and modal
2. `app/patient/page.tsx` - Added cancel button and modal
3. `app/admin/page.tsx` - Added referrals tab and view

---

## 🎨 UI/UX Features

### Visual Indicators:
- **Referral Status Badges:**
  - 🟡 Pending - Yellow
  - 🟢 Approved - Green
  - 🔴 Rejected - Red

- **Appointment Status:**
  - 🔴 Cancelled - Red with strike-through
  - Shows who cancelled and when

### Notifications:
- Toast notifications for success/error
- Confirmation dialogs for important actions

---

## 🔐 Security & Permissions

### Role-Based Access:
- **Doctors:** Can only refer their own patients
- **Patients:** Can only cancel their own appointments
- **Admins:** Can review all referrals and override cancellations

### Validation:
- Cannot cancel past appointments
- Cannot refer to same doctor
- Cannot cancel already cancelled appointments

---

## 🧪 Testing Checklist

After implementation, test these scenarios:

### Doctor Referral:
- [ ] Doctor can see "Refer" button on appointments
- [ ] Can select another doctor from dropdown
- [ ] Referral appears in admin dashboard
- [ ] Admin can approve/reject
- [ ] New appointment created on approval

### Patient Cancellation:
- [ ] Patient can see "Cancel" button
- [ ] Cancellation modal appears
- [ ] After cancellation, status shows "Cancelled"
- [ ] Cannot cancel already cancelled appointments

### Edge Cases:
- [ ] Cannot refer to self
- [ ] Cannot cancel past appointments
- [ ] Only active appointments show cancel button
- [ ] Referral dropdown excludes referring doctor

---

## 🆘 Troubleshooting

### Common Issues:

**"Table referrals does not exist"**
- Solution: Run the SQL migration in Supabase

**"Permission denied for table referrals"**
- Solution: Check RLS (Row Level Security) policies in Supabase

**Referrals not showing in admin panel**
- Solution: Verify the query is joining all necessary tables

**Cancel button not appearing**
- Solution: Check appointment status - only shows for active appointments

---

## 📞 Next Steps

After I implement the code:

1. **Run the SQL migration** (Step 1 above)
2. **Test in development**
3. **Review the UI/UX**
4. **Provide feedback** for any adjustments

Ready to proceed? I'll now implement all the code! 🚀
