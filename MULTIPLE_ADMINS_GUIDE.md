# 🔄 Multiple Admin Accounts - Quick Guide

## ✅ How Admin Accounts Work

Each admin account (`admin@hospital.com`, `admin2@hospital.com`, etc.) is a **separate and independent entity**:

- ✅ Each admin has their own login credentials
- ✅ Each admin's name is displayed in the dashboard header
- ✅ Each admin can create doctors, patients, staff, pharmacists
- ✅ Currently, all admins **share the same hospital data** (see all doctors/patients)

---

## 🔐 How to Switch Between Admin Accounts

### Step 1: Logout from Current Admin

**IMPORTANT:** You must logout before switching accounts!

1. Click the **"Logout"** button in the top-right corner
2. You'll be redirected to the login page
3. Browser session is cleared

### Step 2: Login as Different Admin

1. Enter the new admin credentials:
   - Email: `admin2@hospital.com`
   - Password: `Harsh@123`
2. Click "Sign In"
3. You'll see the new admin's name in the dashboard

---

## 🧪 Test: Verify You're Logged In as Correct Admin

After logging in, check the **top-right corner** of the admin dashboard:
- You should see the admin's name
- For `admin@hospital.com` → Shows "Admin User" (or whatever name you set)
- For `admin2@hospital.com` → Shows "Admin User" (or whatever name you set)

---

## ⚠️ Common Issue: Browser Cache

If you see the wrong admin's name after logging in:

### Fix 1: Clear Browser Storage
1. Press **F12** to open Developer Tools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → Your site URL
4. Delete the `currentUser` key
5. Reload the page
6. Login again

### Fix 2: Use Incognito/Private Window
1. Open a new **Incognito/Private window** (Ctrl+Shift+N in Chrome)
2. Go to your login page
3. Login with the second admin account
4. This will keep sessions separate

### Fix 3: Use Different Browsers
- Use Chrome for `admin@hospital.com`
- Use Edge/Firefox for `admin2@hospital.com`
- Each browser has its own session

---

## 📊 Current System Behavior

### What's Separate:
- ✅ Login credentials (email & password)
- ✅ User profile (name, email, phone)
- ✅ Session management (who's logged in)

### What's Shared:
- ⚠️ **Doctors** - All admins see the same doctors
- ⚠️ **Patients** - All admins see the same patients
- ⚠️ **Appointments** - All admins see the same appointments
- ⚠️ **Staff** - All admins see the same staff
- ⚠️ **Pharmacists** - All admins see the same pharmacists

**Why?** The current system is designed for **one hospital with multiple administrators** (like having multiple people with admin access to the same hospital system).

---

## 🏥 Want Each Admin to Have Their Own Hospital?

If you want each admin to manage a **completely separate set of data** (separate hospitals/clinics):

### We need to add:
1. **Admin ID tracking** - Track which admin created each doctor/patient
2. **Data filtering** - Show only data created by the logged-in admin
3. **Database changes** - Add `created_by_admin_id` column to tables

### Example:
```
admin@hospital.com creates:
  - Dr. Smith
  - Patient John

admin2@hospital.com creates:
  - Dr. Jones
  - Patient Mary

Result:
  - admin@hospital.com only sees Dr. Smith & John
  - admin2@hospital.com only sees Dr. Jones & Mary
```

**Would you like me to implement this?** (Let me know!)

---

## 🎯 Quick Checklist

Before creating a new admin account:

- [ ] Run the migration: `006_add_superadmin_role.sql`
- [ ] Login as SuperAdmin
- [ ] Create the new admin via SuperAdmin dashboard
- [ ] **Logout** from SuperAdmin
- [ ] Login as the new admin
- [ ] Verify the correct name shows in top-right corner

---

## 🔧 Troubleshooting

### Issue: "Invalid email or password"
**Solution:** Run the password generation script:
```powershell
node scripts/create-admin2.js
```
Then run the SQL in Supabase.

### Issue: Still seeing old admin's name
**Solution:** 
1. Logout completely
2. Clear browser cache (F12 → Application → Clear Local Storage)
3. Close all browser tabs
4. Reopen and login again

### Issue: Changes made by one admin not visible to other admin
**Solution:** This is expected if you've customized the system for separate data. Refresh the page to see updates.

---

## 📱 Testing Multiple Admins

### Method 1: Sequential Testing
1. Login as admin1
2. Create a doctor
3. Logout
4. Login as admin2
5. You should see the same doctor (shared system)

### Method 2: Simultaneous Testing
1. Open Chrome - Login as admin1
2. Open Firefox - Login as admin2
3. Both can work simultaneously
4. Both see the same data

---

## ✅ Summary

- **Each admin is a separate user** with unique credentials
- **All admins currently share hospital data** (designed for multi-admin one-hospital)
- **Must logout before switching** between admin accounts
- **Check the name in top-right** to verify which admin is logged in

---

**Need separate data per admin?** Let me know and I'll implement admin-specific data isolation!
