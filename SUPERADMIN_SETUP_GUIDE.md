# 🚀 SuperAdmin Setup Guide for Beginners

Welcome! This guide will walk you through setting up the SuperAdmin role in your hospital management system step by step.

## 📋 What is SuperAdmin?

The **SuperAdmin** is the highest level of access in the system with these responsibilities:
- Create and delete Admin accounts
- Change Admin passwords
- View all Admins

**Role Hierarchy:**
```
SuperAdmin (top level)
  └─→ Creates/Manages Admins
        └─→ Admins Create/Manage:
              ├─→ Doctors
              ├─→ Patients
              ├─→ Pharmacists
              └─→ Staff
```

## ⚙️ Step 1: Run Database Migrations

You need to run two migration files to set up the new features:

### For Migration 005 (Staff & Rooms System)
Open your database tool (Supabase SQL Editor) and run:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the contents of `database/migrations/005_add_staff_and_rooms_system.sql`
4. Paste it into the SQL Editor
5. Click "Run" button

### For Migration 006 (SuperAdmin Role)
Repeat the same process with `database/migrations/006_add_superadmin_role.sql`

**What these migrations do:**
- Migration 005: Adds 'staff' role and creates rooms/beds tables
- Migration 006: Adds 'superadmin' role and creates a default superadmin account

## 🔑 Step 2: First Login as SuperAdmin

After running the migrations, a default SuperAdmin account is created:

**Default Credentials:**
```
Email: superadmin@hospital.com
Password: SuperAdmin@123
```

### To login:
1. Start your development server if not already running:
   ```powershell
   pnpm dev
   ```

2. Open your browser and go to: `http://localhost:3000/login`

3. Enter the default credentials above

4. You'll be redirected to: `http://localhost:3000/superadmin`

## 🔐 Step 3: Change SuperAdmin Password (IMPORTANT!)

**For security, you should change the default password immediately!**

Since we haven't created a UI for SuperAdmin to change their own password yet, use the database:

1. Go to Supabase SQL Editor
2. Run this SQL (replace `your-new-password` with your desired password):

```sql
-- First, generate a bcrypt hash of your new password
-- You can use an online bcrypt generator like: https://bcrypt-generator.com/
-- Use cost factor: 10
-- Example: if your new password is "MySecure@Pass123", generate its hash

-- Then update the password:
UPDATE users 
SET password_hash = '$2a$10$YOUR_GENERATED_HASH_HERE'
WHERE email = 'superadmin@hospital.com';
```

**Alternative Method (Easier for beginners):**
Use the password reset feature:
1. On the login page, click "Forgot password?"
2. Enter: superadmin@hospital.com
3. Check your email for the reset link
4. Follow the link and set a new password

## 👥 Step 4: Create Your First Admin

Now that you're logged in as SuperAdmin:

1. You'll see the **Super Admin Dashboard**
2. Click the **"Add Admin"** button
3. Fill in the form:
   - **Name**: Full name of the admin (e.g., "John Smith")
   - **Email**: Their work email (e.g., "john@hospital.com")
   - **Phone**: Contact number (e.g., "1234567890")
   - **Password**: Create a secure password (minimum 6 characters)
4. Click **"Create Admin"**
5. The new admin will appear in the table!

## 🔄 Step 5: Managing Admins

### View All Admins
The dashboard shows all admins with:
- Name
- Email
- Phone
- Creation date
- Action buttons

### Change Admin Password
1. Find the admin in the table
2. Click **"Change Password"** button
3. Enter new password (minimum 6 characters)
4. Click **"Change Password"** to confirm

### Delete an Admin
1. Find the admin in the table
2. Click **"Delete"** button
3. Confirm the deletion in the popup
4. The admin will be removed

## 📱 Step 6: Test Admin Login

After creating an admin:

1. Open a new incognito/private browser window
2. Go to: `http://localhost:3000/login`
3. Login with the admin credentials you just created
4. You should be redirected to: `http://localhost:3000/admin`
5. The admin can now create Doctors, Patients, Pharmacists, and Staff

## 🎯 Testing Checklist

Mark these off as you complete them:

- [ ] Migration 005 run successfully
- [ ] Migration 006 run successfully
- [ ] Logged in as SuperAdmin with default credentials
- [ ] Changed SuperAdmin password
- [ ] Created first Admin account
- [ ] Changed Admin password (test the feature)
- [ ] Logged in as Admin in separate browser
- [ ] Verified Admin can access admin dashboard
- [ ] Deleted test Admin account (test the feature)

## ❓ Common Issues & Solutions

### Issue 1: "User role not found" error
**Solution:** Make sure you ran migration 006 which adds 'superadmin' to the role constraint.

### Issue 2: Can't login with default credentials
**Solution:** 
1. Check if migration 006 ran successfully
2. Verify in Supabase Table Editor → users table
3. Look for user with email: superadmin@hospital.com

### Issue 3: "Failed to create admin"
**Solution:**
1. Check browser console (F12) for errors
2. Ensure email is not already in use
3. Password must be at least 6 characters

### Issue 4: Dark mode not working
**Solution:** Restart your development server (stop with Ctrl+C, then run `pnpm dev` again)

## 🔍 Verifying Your Setup

### Check in Supabase:

1. **Go to Table Editor → users**
2. You should see:
   - One user with role = 'superadmin'
   - Any admins you created with role = 'admin'

3. **Check the roles are correct:**
```sql
SELECT name, email, role, created_at 
FROM users 
WHERE role IN ('superadmin', 'admin')
ORDER BY created_at DESC;
```

## 🎓 Understanding the System

### File Structure:
```
app/
  superadmin/
    page.tsx              ← SuperAdmin dashboard page
  login/
    page.tsx              ← Login page (updated with superadmin routing)

components/
  superadmin/
    AdminsView.tsx        ← Admin management component

lib/
  auth.ts                 ← Added changeUserPassword function

database/
  migrations/
    006_add_superadmin_role.sql  ← SuperAdmin migration
```

### Key Functions:
- `createUser()` - Creates new users (including admins)
- `changeUserPassword()` - Changes any user's password (SuperAdmin only)
- `getCurrentUser()` - Gets current logged-in user

## 📞 Need Help?

If you encounter any issues:

1. **Check the browser console:**
   - Press F12
   - Go to "Console" tab
   - Look for red error messages

2. **Check the terminal:**
   - Look at where you ran `pnpm dev`
   - Check for any error messages

3. **Verify migrations:**
   - Go to Supabase → SQL Editor
   - Run: `SELECT * FROM users WHERE role = 'superadmin';`
   - You should see one result

4. **Restart everything:**
   ```powershell
   # Stop the server (Ctrl+C)
   pnpm dev
   ```

## 🎉 Next Steps

After setup is complete:

1. **Create your admin team:**
   - Create accounts for each hospital administrator
   - Share credentials securely

2. **Let admins set up the system:**
   - Admins create doctor accounts
   - Admins create patient accounts
   - Admins create staff accounts
   - Admins create pharmacist accounts

3. **Regular maintenance:**
   - Regularly review admin accounts
   - Change passwords periodically
   - Remove inactive accounts

## 🔒 Security Best Practices

1. **Strong Passwords:**
   - Use at least 12 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Example: `SecureHosp!tal2025@Admin`

2. **Keep Credentials Safe:**
   - Never share SuperAdmin password
   - Use password managers
   - Don't write passwords down

3. **Regular Audits:**
   - Review who has admin access
   - Remove old accounts
   - Check for suspicious activity

---

## 🎯 Quick Reference Commands

**Start Development Server:**
```powershell
pnpm dev
```

**Stop Server:**
```
Press Ctrl+C in the terminal
```

**Check if server is running:**
Open browser → `http://localhost:3000`

---

**That's it! You're all set up! 🚀**

If you followed all steps, you now have a fully functional SuperAdmin system with the ability to manage all hospital administrators.
