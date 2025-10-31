# 🎉 New Features Testing Guide

## ✅ Features Completed

### 1. Doctor Referral System
Allows doctors to refer patients to other specialists with admin approval.

### 2. Patient Appointment Cancellation  
Allows patients to cancel their own appointments with reason tracking.

---

## 🚀 How to Test Each Feature

### Testing Doctor Referral Feature

#### As a Doctor:

1. **Login as a Doctor**
   - Go to `/login`
   - Use your doctor credentials
   - You'll be redirected to `/doctor`

2. **Find an Appointment to Refer**
   - Look for appointments with status **"Accepted"** or **"Rescheduled"**
   - These appointments will have a purple **"Refer to Specialist"** button

3. **Create a Referral**
   - Click the **"Refer to Specialist"** button
   - A beautiful modal will open with:
     - **Select Doctor**: Choose the specialist (your name won't appear in the list)
     - **Reason for Referral**: Explain why you're referring (required)
   - Click **"Submit Referral"**
   - You'll see a success message: "Referral submitted successfully! Admin will review it."

4. **What Happens Next?**
   - Admin receives the referral request
   - Original appointment stays active until admin approves
   - You can continue working with other appointments

#### As an Admin:

1. **Login as Admin**
   - Go to `/login`
   - Use admin credentials
   - You'll be redirected to `/admin`

2. **View Referrals**
   - Click on the **"Referrals"** tab (icon with user-plus)
   - You'll see all referrals with:
     - **Patient name**
     - **Original doctor** (who made the referral)
     - **Referred to doctor** (specialist)
     - **Reason for referral**
     - **Status** (Pending/Approved/Rejected)

3. **Filter Referrals**
   - Use the filter dropdown to view:
     - All referrals
     - Pending only
     - Approved only
     - Rejected only

4. **Approve a Referral**
   - Click **"Approve"** button (green)
   - System will:
     - Cancel the original appointment
     - Create a new appointment with the specialist
     - Keep the same date, time, and reason
     - Update referral status to "Approved"
   - You'll see: "Referral approved and new appointment created!"

5. **Reject a Referral**
   - Click **"Reject"** button (red)
   - System will:
     - Keep original appointment active
     - Update referral status to "Rejected"
   - You'll see: "Referral rejected"

---

### Testing Patient Cancellation Feature

#### As a Patient:

1. **Login as a Patient**
   - Go to `/login`
   - Use your patient credentials
   - You'll be redirected to `/patient`

2. **View Your Appointments**
   - You'll see all your appointments with different statuses

3. **Cancel an Appointment**
   - Find appointments with status:
     - **Pending** (waiting for doctor confirmation)
     - **Accepted** (confirmed by doctor)
     - **Rescheduled** (date/time changed)
   - You'll see a red **"Cancel Appointment"** button at the bottom

4. **Use the Cancellation Modal**
   - Click **"Cancel Appointment"**
   - A modal opens showing:
     - **Appointment details** (date, time, doctor)
     - **Warning message** about cancellation
     - **Reason for cancellation** (optional text field)
   - Click **"Yes, Cancel Appointment"**

5. **Confirm Cancellation**
   - A **confirmation screen** appears:
     - Shows what will happen
     - Asks for final confirmation
   - Click **"Confirm Cancellation"**
   - You'll see: "Appointment cancelled successfully!"
   - The appointment will be removed from your list

6. **Which Appointments Can't Be Cancelled?**
   - ❌ **Rejected** appointments (already denied)
   - ❌ **Completed** appointments (already finished)
   - ❌ **Cancelled** appointments (already cancelled)

---

## 🔍 What to Look For During Testing

### Visual Elements to Check:

#### Doctor Page:
- ✅ Purple/pink gradient "Refer to Specialist" button appears on correct appointments
- ✅ Referral modal has smooth animation
- ✅ Success notification appears in top-right corner
- ✅ Notification disappears after 3 seconds

#### Admin Page:
- ✅ New "Referrals" tab with user-plus icon
- ✅ Referral cards display all information clearly
- ✅ Status badges have correct colors:
  - Yellow for Pending
  - Green for Approved  
  - Red for Rejected
- ✅ Filter dropdown works correctly
- ✅ Approve/Reject buttons disabled on already-processed referrals

#### Patient Page:
- ✅ Red "Cancel Appointment" button appears on cancellable appointments
- ✅ Button is full-width and prominent
- ✅ Modal shows appointment details correctly
- ✅ Two-step confirmation process prevents accidental cancellations
- ✅ Success notification shows after cancellation

---

## 📊 Database Verification

### Check the Database Tables:

1. **Go to Supabase Dashboard**
   - Navigate to **Table Editor**

2. **Check `referrals` Table**
   ```sql
   -- Should have columns:
   - id (uuid)
   - original_appointment_id (uuid)
   - referring_doctor_id (uuid)
   - referred_to_doctor_id (uuid)
   - patient_id (uuid)
   - reason (text)
   - status (text) -- 'pending', 'approved', 'rejected'
   - new_appointment_id (uuid, nullable)
   - reviewed_by (uuid, nullable)
   - reviewed_at (timestamp, nullable)
   - created_at (timestamp)
   ```

3. **Check `appointments` Table Updates**
   ```sql
   -- Should have new columns:
   - cancelled_at (timestamp, nullable)
   - cancelled_by (uuid, nullable)
   - cancellation_reason (text, nullable)
   
   -- And status should now include 'cancelled'
   ```

4. **Test Database Queries**
   ```sql
   -- View all referrals with patient and doctor names
   SELECT 
     r.*,
     p.users.name as patient_name,
     rd.users.name as referring_doctor,
     rtd.users.name as referred_to_doctor
   FROM referrals r
   JOIN patients p ON r.patient_id = p.id
   JOIN doctors rd ON r.referring_doctor_id = rd.id
   JOIN doctors rtd ON r.referred_to_doctor_id = rtd.id
   ORDER BY r.created_at DESC;

   -- View cancelled appointments
   SELECT * FROM appointments 
   WHERE status = 'cancelled' 
   ORDER BY cancelled_at DESC;
   ```

---

## 🐛 Common Issues and Solutions

### Issue 1: Referral Button Not Showing
**Problem**: Button doesn't appear on accepted appointments
**Check**:
- Is the appointment status exactly "accepted" or "rescheduled"?
- Is the appointment completed? (completed_at should be null)
- Check browser console for errors

### Issue 2: Admin Can't See Referrals
**Problem**: Referrals tab is empty
**Check**:
- Did you run the SQL migration?
- Are there any referrals in the database?
- Check Supabase logs for query errors

### Issue 3: Cancel Button Not Working
**Problem**: Click doesn't open modal
**Check**:
- Is the appointment status pending, accepted, or rescheduled?
- Check browser console for errors
- Verify CancelAppointmentModal import is correct

### Issue 4: Modal Doesn't Close
**Problem**: Modal stays open after submission
**Check**:
- Check network tab for failed API requests
- Look for error messages in console
- Verify Supabase connection

---

## 🎨 UI/UX Features to Appreciate

### Design Highlights:

1. **Gradients Everywhere** 🌈
   - Purple to pink gradients on referral buttons
   - Smooth color transitions
   - Matches theme colors

2. **Smooth Animations** ✨
   - Modal fade-in/fade-out
   - Button hover effects
   - Scale transformations on hover

3. **Two-Step Confirmation** 🔒
   - Prevents accidental cancellations
   - Clear warnings
   - Confirmation screen

4. **Responsive Design** 📱
   - Works on mobile devices
   - Touch-friendly buttons
   - Readable on small screens

5. **Dark Mode Support** 🌙
   - All colors adapt to theme
   - Proper contrast maintained
   - CSS variables for consistency

---

## 📝 Test Scenarios

### Scenario 1: Complete Referral Flow
1. Doctor refers patient to specialist
2. Admin receives referral notification
3. Admin approves referral
4. New appointment created
5. Old appointment cancelled
6. Patient sees new appointment with new doctor

### Scenario 2: Rejected Referral
1. Doctor refers patient
2. Admin rejects referral
3. Original appointment remains active
4. Doctor and patient see no change

### Scenario 3: Patient Cancels Appointment
1. Patient has accepted appointment
2. Patient clicks cancel button
3. Patient provides reason (optional)
4. Patient confirms cancellation
5. Appointment removed from list
6. Doctor sees appointment as cancelled

### Scenario 4: Multiple Referrals
1. Doctor creates multiple referrals
2. Admin sees all referrals listed
3. Admin can filter by status
4. Admin processes them one by one

---

## ✅ Final Checklist

Before considering testing complete, verify:

- [ ] SQL migration executed successfully in Supabase
- [ ] `referrals` table exists with correct columns
- [ ] `appointments` table has cancellation columns
- [ ] Doctor can create referrals
- [ ] Admin can see referrals tab
- [ ] Admin can approve referrals
- [ ] Admin can reject referrals
- [ ] New appointments created on approval
- [ ] Patient can cancel appointments
- [ ] Cancel modal shows correct details
- [ ] Two-step confirmation works
- [ ] Success notifications appear
- [ ] Database records updated correctly
- [ ] No console errors
- [ ] Works in both light and dark themes
- [ ] Responsive on mobile devices

---

## 🎓 For Beginners: Understanding the Flow

### How Referral System Works:

```
Patient has appointment with Doctor A (General Physician)
         ↓
Doctor A sees patient needs specialist care
         ↓
Doctor A clicks "Refer to Specialist" button
         ↓
Doctor A selects Doctor B (Cardiologist) and explains why
         ↓
Referral request sent to Admin (status: pending)
         ↓
Admin reviews the referral request
         ↓
Admin clicks "Approve"
         ↓
System automatically:
  - Cancels appointment with Doctor A
  - Creates new appointment with Doctor B
  - Uses same date, time, and reason
  - Updates referral status to "approved"
         ↓
Patient now has appointment with Doctor B (specialist)
```

### How Cancellation System Works:

```
Patient has confirmed appointment
         ↓
Patient logs into portal
         ↓
Patient sees "Cancel Appointment" button (red)
         ↓
Patient clicks button
         ↓
Modal opens showing:
  - Appointment details
  - Warning message
  - Optional reason field
         ↓
Patient clicks "Yes, Cancel Appointment"
         ↓
Confirmation screen appears
         ↓
Patient clicks "Confirm Cancellation"
         ↓
System updates:
  - appointment.status = 'cancelled'
  - appointment.cancelled_at = current timestamp
  - appointment.cancelled_by = patient user_id
  - appointment.cancellation_reason = (if provided)
         ↓
Appointment removed from patient's list
Doctor can still see it as "cancelled" in their dashboard
```

---

## 🔧 Developer Notes

### Files Modified:
- `app/doctor/page.tsx` - Added referral functionality
- `app/patient/page.tsx` - Added cancellation functionality
- `app/admin/page.tsx` - Added referrals tab
- `components/doctor/ReferralModal.tsx` - Created
- `components/patient/CancelAppointmentModal.tsx` - Created
- `components/admin/ReferralsView.tsx` - Created
- `components/Icons.tsx` - Added userPlus icon
- `database/migrations/004_add_referral_system.sql` - Database changes

### Key Functions:
- `handleReferPatient()` - Opens referral modal
- `handleReferralSuccess()` - Success callback
- `handleCancelAppointment()` - Opens cancel modal
- `handleCancelSuccess()` - Success callback
- `loadReferrals()` - Admin fetches referrals
- `handleApprove()` - Admin approves referral
- `handleReject()` - Admin rejects referral

---

## 🎯 Success Criteria

The features are working correctly when:

1. ✅ Doctors can refer patients smoothly
2. ✅ Admin can manage all referrals
3. ✅ New appointments created correctly
4. ✅ Patients can cancel appointments
5. ✅ Database tracks all changes
6. ✅ UI is responsive and beautiful
7. ✅ No errors in console
8. ✅ Works in all themes

---

## 📞 Need Help?

If you encounter issues:

1. **Check the Browser Console**: Look for error messages (F12 → Console tab)
2. **Check Supabase Logs**: Go to Supabase Dashboard → Logs
3. **Verify Database**: Ensure migration ran successfully
4. **Check File Imports**: Make sure all components are imported correctly
5. **Clear Browser Cache**: Sometimes helps with style issues

**Remember**: You're doing great as a beginner! Testing thoroughly will help you understand how everything works together. 🎉
