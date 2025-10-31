# Fast2SMS Integration Setup Guide

## ✅ Changes Implemented

### 1. **Fixed Appointments Loading** 
- Fixed database query syntax to use Supabase foreign key relationships:
  ```typescript
  patients!appointments_patient_id_fkey (...)
  doctors!appointments_doctor_id_fkey (...)
  ```

### 2. **Book Appointment Feature**
- Added "Book Appointment" button in doctor dashboard header
- Created booking modal with:
  - Patient selection dropdown
  - Date and time pickers
  - Reason textarea
  - Submit and cancel buttons

### 3. **SMS Reminder Feature**
- Added `sendAppointmentReminder()` function with Fast2SMS integration
- Added **"Send Reminder"** button (orange color) for:
  - ✅ Pending appointments
  - ✅ Accepted/Rescheduled appointments
- SMS message template:
  ```
  Hi {patient_name}, this is a reminder for your appointment on {date} at {time}. Dr. {doctor_name}. NetBro HIMS
  ```

---

## 🔧 Required Setup

### Step 1: Get Fast2SMS API Key

1. Go to [https://www.fast2sms.com](https://www.fast2sms.com)
2. Sign up or log in to your account
3. Navigate to **API** section
4. Copy your **API Key** (authorization token)
5. Register a **DLT Template ID** for the message format

### Step 2: Configure Environment Variables

Create or update `.env.local` file in your project root:

```env
# Fast2SMS Configuration
NEXT_PUBLIC_FAST2SMS_API_KEY=your_actual_api_key_here

# Optional: If you have a specific DLT template ID
NEXT_PUBLIC_FAST2SMS_TEMPLATE_ID=your_template_id_here

# Optional: Custom sender ID (default is NBROHI)
NEXT_PUBLIC_FAST2SMS_SENDER_ID=NBROHI
```

### Step 3: DLT Template Registration

Register this template with Fast2SMS DLT:

```
Hi {#var#}, this is a reminder for your appointment on {#var#} at {#var#}. Dr. {#var#}. NetBro HIMS
```

Variables order:
1. Patient Name
2. Appointment Date
3. Appointment Time
4. Doctor Name

### Step 4: Update Code (Optional)

If you have a specific template ID, update `app/doctor/page.tsx`:

```typescript
// Replace this line in sendAppointmentReminder function:
message: 167925,  // Replace with your actual DLT template ID
```

---

## 🧪 Testing

### Test SMS Reminder:

1. **Login as Doctor**
2. **Navigate to Dashboard**
3. **Find an Appointment** (pending or accepted)
4. **Click "Send Reminder" button** (orange button with bell icon)
5. **Check Console** for API response
6. **Verify Patient Receives SMS**

### Console Logs to Check:

```javascript
// Success response
{ status: 'success', message: 'SMS sent successfully!' }

// Error response
{ status: 'error', message: 'Failed to send SMS' }
```

---

## 🔍 Troubleshooting

### Appointments Not Loading
**Check browser console for errors:**
```
- Foreign key relationship errors
- Database query syntax errors
- Authentication issues
```

**Solution:** Ensure Supabase policies allow doctors to query appointments with patient/doctor joins.

### SMS Not Sending

**Check:**
1. ✅ API key is correctly set in `.env.local`
2. ✅ Restart development server after adding env variables
3. ✅ Patient has valid phone number in database
4. ✅ Fast2SMS account has sufficient credits
5. ✅ DLT template is approved and active

**Common Errors:**
- `403 Forbidden`: Invalid API key
- `400 Bad Request`: Invalid phone number format or template ID
- `402 Payment Required`: Insufficient credits

### Phone Number Format

Fast2SMS requires Indian phone numbers:
- ✅ Format: `9876543210` (10 digits, no prefix)
- ❌ Wrong: `+919876543210` or `919876543210`

The code automatically cleans phone numbers:
```typescript
const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10)
```

---

## 📋 Features Overview

### Book Appointment Button
- Location: Doctor dashboard header (top right)
- Opens modal with patient selection
- Sets appointment status to 'accepted' by default
- Shows success notification

### Send Reminder Button
- **Color:** Orange gradient (from-orange-500 to-orange-600)
- **Icon:** Bell icon
- **Available for:** Pending & Accepted/Rescheduled appointments
- **Action:** Sends SMS to patient with appointment details

### Button Locations
```
Pending Appointments:
- ✅ Accept (green)
- ❌ Reject (red)
- 📅 Reschedule (blue)
- 🔔 Send Reminder (orange)

Accepted/Rescheduled Appointments:
- 📝 Add Notes (gradient)
- 🔔 Send Reminder (orange)
- 👥 Refer (purple)
- ✅ Complete (gray)
```

---

## 🚀 Next Steps

1. ✅ Add your Fast2SMS API key to `.env.local`
2. ✅ Restart your development server
3. ✅ Test the booking feature
4. ✅ Test SMS reminder functionality
5. ✅ Verify all appointments load correctly

---

## 📞 Support

If you encounter issues:
- Check browser console for errors
- Verify Supabase database relationships
- Ensure Fast2SMS account is active
- Check phone number formats in database

---

**Last Updated:** Today  
**Version:** 1.0  
**Status:** Ready for testing
