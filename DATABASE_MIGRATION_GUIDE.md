# 📋 Database Migration Guide - Doctor Features

## ⚠️ IMPORTANT: Run This Before Testing Doctor Features!

This guide will help you add new columns to your database for the doctor's notes and prescription features.

---

## 🎯 What This Migration Does

Adds three new columns to your `appointments` table:
- **doctor_notes** - For doctor's observations and diagnosis
- **prescription** - For medications and dosage instructions  
- **completed_at** - Timestamp when appointment is marked complete

---

## 📝 Step-by-Step Instructions

### Step 1: Login to Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign in"** (top right)
3. Login with your account
4. Click on your **Hospital Management System** project

### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Click on the **"SQL Editor"** icon (looks like `</>`)
3. Click **"New query"** button (top right, or it might say "+ New Query")

### Step 3: Paste the Migration SQL
1. Open the file: `database/migrations/002_add_appointment_notes.sql`
2. **Copy ALL the text** from that file
3. **Paste it** into the SQL Editor window in Supabase

### Step 4: Run the Migration
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for the green success message: ✅ **"Success. No rows returned"**
3. If you see an error, **DON'T PANIC**:
   - Check if you copied the entire SQL file
   - Make sure you're in the correct project
   - Take a screenshot and ask for help

### Step 5: Verify the Migration
1. In the left sidebar, click **"Table Editor"**
2. Click on the **"appointments"** table
3. Scroll right to see the new columns:
   - `doctor_notes`
   - `prescription`
   - `completed_at`
4. If you see these columns, **SUCCESS!** ✅

---

## ✅ Testing the New Features

After running the migration, test the doctor features:

### 1. Login as Doctor
- Go to `http://localhost:3000/login`
- Use a doctor account

### 2. Test Adding Notes & Prescription
- Find an **accepted** appointment
- Click **"Add Notes"** button
- Enter some test notes (e.g., "Patient has fever. Prescribed medication.")
- Enter prescription (e.g., "Paracetamol 500mg - Take 1 tablet every 6 hours")
- Click **"Save Notes"**
- Refresh the page - your notes should appear!

### 3. Test Reschedule
- Find a **pending** appointment
- Click **"Reschedule"** button
- Select a new date and time
- Click **"Save Reschedule"**
- The patient should receive an email (if you've set up Resend API)

### 4. Test Mark as Completed
- Find an **accepted** appointment  
- Click **"Complete"** button
- Confirm the action
- The appointment status should change to "COMPLETED"
- A completion timestamp should appear

---

## 🔧 Troubleshooting

### ❌ Error: "column already exists"
**Solution:** The migration was already run! You're good to go. Skip to testing.

### ❌ Error: "permission denied"
**Solution:** Make sure you're logged into the correct Supabase account that owns this project.

### ❌ Can't see the new columns
**Solution:** 
1. Refresh your browser (F5)
2. Check if the SQL ran successfully (green checkmark)
3. Try running the SQL again

### ❌ Features not working after migration
**Solution:**
1. Stop your dev server (`Ctrl+C` in terminal)
2. Restart it: `pnpm run dev`
3. Clear your browser cache (Ctrl+Shift+Delete)
4. Try again

---

## 🎓 For Complete Beginners

**What is a migration?**
A migration is like updating the structure of your filing cabinet. We're adding new drawers (columns) to store doctor notes and prescriptions.

**Is this safe?**
Yes! This migration only **adds** new columns. It doesn't delete or modify any existing data.

**Can I undo this?**
Yes, but it's not recommended. Your existing data is 100% safe.

**What if I mess up?**
Don't worry! The worst case is you need to re-run the SQL. Your patient and doctor data is safe.

---

## 📞 Need Help?

If you get stuck:
1. Take a screenshot of any error messages
2. Note which step you're on
3. Ask for help with the screenshot

**Common mistakes:**
- ❌ Copying only part of the SQL file
- ❌ Running in the wrong Supabase project
- ❌ Not waiting for the success message
- ❌ Forgetting to restart the dev server

---

## ✨ After Migration Success

Once the migration is complete:
- ✅ Doctors can add notes and prescriptions
- ✅ Appointments can be rescheduled with email notifications
- ✅ Completed appointments are tracked with timestamps
- ✅ All data syncs with your Supabase database

**Next Step:** Set up email notifications (see `EMAIL_SETUP_GUIDE.md`)
