# 🚀 Quick Start - Test Your New Features Now!

## ✅ Prerequisites Check

Before you start, make sure:
- ✅ SQL migration was run in Supabase (you confirmed this already!)
- ✅ Development server is running (`npm run dev` or `pnpm dev`)
- ✅ You have test accounts for doctor, admin, and patient roles

---

## 🎯 5-Minute Quick Test

### Test 1: Doctor Referral (2 minutes)

1. **Login as a doctor** at `http://localhost:3000/login`

2. **Look for an "Accepted" appointment**
   - Scroll through your appointments list
   - Find one with green "Accepted" badge
   
3. **Click the purple "Refer to Specialist" button**
   - Should be below the appointment notes section
   - Modal should slide in smoothly

4. **Fill out the form:**
   - Select any other doctor from dropdown
   - Type a reason (e.g., "Patient needs cardiology consultation")
   - Click "Submit Referral"

5. **Expected Result:**
   - ✅ Success message appears: "Referral submitted successfully! Admin will review it."
   - ✅ Message disappears after 3 seconds
   - ✅ Modal closes

---

### Test 2: Admin Approval (2 minutes)

1. **Login as admin** at `http://localhost:3000/login`

2. **Click "Referrals" tab**
   - Look for tab with user-plus icon
   - Should be next to "Pharmacists" tab

3. **See your referral**
   - Yellow "Pending" badge
   - Shows patient name, referring doctor, specialist

4. **Click green "Approve" button**

5. **Expected Result:**
   - ✅ Success message: "Referral approved and new appointment created!"
   - ✅ Badge changes to green "Approved"
   - ✅ Buttons disappear (already processed)

---

### Test 3: Patient Cancellation (1 minute)

1. **Login as a patient** at `http://localhost:3000/login`

2. **Find any appointment** with status:
   - Pending (yellow badge)
   - Accepted (green badge)
   - Rescheduled (blue badge)

3. **Scroll to bottom of appointment card**
   - Should see red "Cancel Appointment" button

4. **Click the button**
   - Modal opens with appointment details
   - Shows warning message

5. **Click "Yes, Cancel Appointment"**
   - Confirmation screen appears

6. **Click "Confirm Cancellation"**

7. **Expected Result:**
   - ✅ Success message: "Appointment cancelled successfully!"
   - ✅ Appointment disappears from list
   - ✅ Modal closes

---

## 🎨 Visual Checklist

### Doctor Page - What You Should See:

```
┌─────────────────────────────────────┐
│  Patient Name                [Badge]│
│  ├─ Date: 2024-01-15               │
│  ├─ Time: 10:00 AM                 │
│  ├─ Email: patient@email.com       │
│  └─ Phone: 1234567890              │
│                                     │
│  Reason: Chest pain                │
│                                     │
│  [Accept] [Reject] [Reschedule]    │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 👤 Refer to Specialist      │  │ ← Purple/Pink Button
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Admin Referrals View - What You Should See:

```
┌─────────────────────────────────────┐
│  Referrals                          │
│  Filter: [All ▼]                    │
├─────────────────────────────────────┤
│  Patient: John Doe      [🟡 Pending]│
│  From: Dr. Smith (General)          │
│  To: Dr. Jones (Cardiologist)       │
│  Reason: Needs specialist care      │
│  Date: 2024-01-15                   │
│                                     │
│  [✓ Approve] [✗ Reject]            │
└─────────────────────────────────────┘
```

### Patient Cancel Modal - What You Should See:

```
┌─────────────────────────────────────┐
│  ⚠️ Cancel Appointment              │
├─────────────────────────────────────┤
│  You are about to cancel:           │
│                                     │
│  👨‍⚕️ Doctor: Dr. Smith               │
│  📅 Date: January 15, 2024          │
│  🕐 Time: 10:00 AM                  │
│                                     │
│  ⚠️ Warning: This action cannot     │
│     be undone easily.               │
│                                     │
│  Reason (optional):                 │
│  ┌─────────────────────────────┐  │
│  │ Personal emergency          │  │
│  └─────────────────────────────┘  │
│                                     │
│  [Cancel] [Yes, Cancel Appointment] │
└─────────────────────────────────────┘
```

---

## 🐛 Common Issues

### Issue: "Refer to Specialist" button not showing

**Check:**
- Is appointment status "accepted" or "rescheduled"?
- Is appointment completed? (completed_at should be null)
- Did you refresh the page?

**Fix:**
- Create a new appointment and accept it
- Make sure it's not completed yet

---

### Issue: Referrals tab empty in admin

**Check:**
- Did you create a referral as doctor?
- Did SQL migration run?
- Check browser console (F12)

**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check Supabase → Table Editor → referrals table exists
4. If table missing, run SQL migration again

---

### Issue: Cancel button not appearing

**Check:**
- Is appointment status pending/accepted/rescheduled?
- Is appointment already cancelled?
- Is appointment completed?

**Fix:**
- Only pending, accepted, and rescheduled appointments can be cancelled
- Create a new appointment to test

---

## 📸 Screenshot Points

Take screenshots of:
1. ✅ Purple "Refer to Specialist" button
2. ✅ Referral modal with form
3. ✅ Admin referrals tab with list
4. ✅ Green "Approved" badge
5. ✅ Red "Cancel Appointment" button
6. ✅ Cancel confirmation modal
7. ✅ Success notifications

---

## 🎯 Quick Verification

### Database Check (30 seconds):

1. Go to Supabase → Table Editor
2. Click `referrals` table
3. Should see your test referral with:
   - Patient ID
   - Referring doctor ID
   - Referred to doctor ID
   - Reason text
   - Status: "approved"

4. Click `appointments` table
5. Find cancelled appointment
6. Should have:
   - status: "cancelled"
   - cancelled_at: timestamp
   - cancelled_by: patient user_id

---

## ✅ Success Indicators

You know it's working when:

### Doctor Side:
- ✅ Button appears on correct appointments
- ✅ Modal opens smoothly
- ✅ Dropdown excludes current doctor
- ✅ Form validates (requires reason)
- ✅ Success notification appears
- ✅ Modal closes automatically

### Admin Side:
- ✅ Tab visible in navigation
- ✅ Referrals load and display
- ✅ Filter dropdown works
- ✅ Status badges colored correctly
- ✅ Approve creates new appointment
- ✅ Buttons disable after action

### Patient Side:
- ✅ Button visible on cancellable appointments
- ✅ Button hidden on completed/rejected
- ✅ Modal shows appointment details
- ✅ Two-step confirmation required
- ✅ Appointment removed after cancel
- ✅ Success notification shows

---

## 🚀 Start Testing Now!

```bash
# 1. Make sure server is running
cd "C:\Users\admin\Desktop\NETBRO-HIMS\NetBro-HIMS"
npm run dev
# or
pnpm dev

# 2. Open browser
# Navigate to: http://localhost:3000

# 3. Login and test!
```

---

## 📝 Quick Test Checklist

Print this and check off as you test:

**Doctor Tests:**
- [ ] See referral button
- [ ] Click button opens modal
- [ ] Can select doctor
- [ ] Can type reason
- [ ] Submit works
- [ ] Notification shows

**Admin Tests:**
- [ ] Referrals tab visible
- [ ] Can see referrals list
- [ ] Filter works
- [ ] Approve works
- [ ] New appointment created
- [ ] Badge turns green

**Patient Tests:**
- [ ] Cancel button visible
- [ ] Click opens modal
- [ ] Can type reason
- [ ] First confirmation works
- [ ] Second confirmation works
- [ ] Appointment disappears

---

## 🎉 Done!

If all checkboxes are checked, **congratulations!** Your features are working perfectly.

### Next Steps:
1. Test with real-world scenarios
2. Try edge cases (cancelling already cancelled, etc.)
3. Test on mobile device
4. Test in dark mode
5. Show to other users for feedback

---

## 📚 Need More Help?

Check these files:
- **FEATURES_TESTING_GUIDE.md** - Detailed testing instructions
- **IMPLEMENTATION_COMPLETE.md** - Complete feature summary
- **REFERRAL_SYSTEM_GUIDE.md** - Original specification

---

**Ready? Let's test! 🚀**
