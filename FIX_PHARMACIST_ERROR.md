# ⚡ QUICK FIX: "Error creating pharmacist user"

## 🔴 The Problem

When you try to create a pharmacist in the admin panel, you get an error:
```
Error creating user: ...
```

## ✅ The Solution

Your `users` table doesn't allow the `'pharmacist'` role yet. You need to run a database migration.

## 📝 Steps to Fix (Takes 2 minutes)

### Step 1: Login to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Open your Hospital Management project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"**

### Step 2: Run Migration #1 - Update User Roles

1. Open this file in VS Code:
   ```
   database/migrations/002_update_user_roles.sql
   ```

2. Copy **ALL** the text from that file

3. Paste it into the Supabase SQL Editor

4. Click **"Run"** button (or press Ctrl+Enter)

5. Wait for: ✅ **"Success. No rows returned"**

### Step 3: Run Migration #2 - Create Pharmacy Tables

1. Open this file in VS Code:
   ```
   database/migrations/003_add_pharmacist_system.sql
   ```

2. Copy **ALL** the text from that file

3. Paste it into the Supabase SQL Editor

4. Click **"Run"** button (or press Ctrl+Enter)

5. Wait for: ✅ **"Success. No rows returned"**

### Step 4: Try Again

1. Go back to your app (http://localhost:3000)
2. Login as Admin
3. Go to **💊 Pharmacists** tab
4. Try creating a pharmacist again
5. It should work now! ✅

## 🔍 What These Migrations Do

### Migration #1 (`002_update_user_roles.sql`)
- Updates the `users` table to accept the `'pharmacist'` role
- Before: Only allowed 'admin', 'doctor', 'patient'
- After: Allows 'admin', 'doctor', 'patient', **'pharmacist'**

### Migration #2 (`003_add_pharmacist_system.sql`)
- Creates 4 new tables:
  - `pharmacy_shops` - Pharmacy information
  - `pharmacists` - Pharmacist profiles
  - `doctor_pharmacy_assignments` - Links doctors to pharmacies
  - `prescription_queue` - Prescription workflow

## ⚠️ Important Notes

1. **Run migrations IN ORDER** - #1 first, then #2
2. **Only run once** - Don't run the same migration multiple times
3. **Backup first** (optional but recommended) - Export your database before running migrations

## 📚 Next Steps

After fixing the error:
1. Create a pharmacy shop
2. Create a pharmacist account
3. Link a doctor to the pharmacy
4. Test the prescription workflow

See **PHARMACIST_SYSTEM_GUIDE.md** for detailed instructions!

## 🆘 Still Getting Errors?

Check the error message in:
- Browser Console (F12 → Console tab)
- Terminal where `pnpm run dev` is running

Common issues:
- Migration syntax error → Copy the ENTIRE file, don't miss any lines
- Network error → Check your internet connection to Supabase
- Permission error → Make sure you're the owner of the Supabase project

---

**Need more help?** Check the full guide: `PHARMACIST_SYSTEM_GUIDE.md`
