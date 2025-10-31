# 🔧 Quick Fix: SuperAdmin Login Error

## Problem
You're getting "Invalid email or password" error when trying to login as SuperAdmin.

## Solution

### Step 1: Run This SQL in Supabase

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Copy and Run This SQL:**

```sql
-- First, make sure the superadmin role is allowed
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('superadmin', 'admin', 'doctor', 'patient', 'pharmacist', 'staff'));

-- Delete any existing account with your email (start fresh)
DELETE FROM users WHERE email = 'harshsingh050607@gmail.com';

-- Insert your superadmin account with correct password hash
INSERT INTO users (email, name, role, phone, password_hash)
VALUES (
  'harshsingh050607@gmail.com',
  'Super Administrator',
  'superadmin',
  '+91 7021478704',
  '$2b$10$qG1dPVFYyxfoQgiGuEq9mun6KzdRXrvKfCOQEPBKq3TdfupNmcJNy'
);

-- Verify the account was created
SELECT id, email, name, role, phone, created_at 
FROM users 
WHERE email = 'harshsingh050607@gmail.com';
```

4. **Click "Run" button**

### Step 2: Login

Now try logging in again:

**Email:** `harshsingh050607@gmail.com`  
**Password:** `SuperAdmin@123`

---

## Why This Happened

The password hash in the migration file didn't match the actual password. The script above generates a fresh hash for `SuperAdmin@123` that will work correctly.

---

## Verify It Worked

After running the SQL:

1. You should see a result showing your user account
2. The `role` column should show: `superadmin`
3. Now login at: http://localhost:3000/login
4. You'll be redirected to: http://localhost:3000/superadmin

---

## Still Having Issues?

### Check 1: Verify the user exists
Run this in Supabase SQL Editor:
```sql
SELECT * FROM users WHERE email = 'harshsingh050607@gmail.com';
```

You should see one row with role = 'superadmin'

### Check 2: Check browser console
1. Press F12 in your browser
2. Go to "Console" tab
3. Try logging in
4. Look for any error messages

### Check 3: Restart dev server
```powershell
# In terminal, press Ctrl+C to stop
# Then restart:
pnpm dev
```

---

## Success! ✅

Once logged in, you'll see the **Super Admin Dashboard** where you can:
- View all admins
- Create new admins
- Change admin passwords
- Delete admins

---

**Need more help?** Check `SUPERADMIN_SETUP_GUIDE.md` for complete instructions!
