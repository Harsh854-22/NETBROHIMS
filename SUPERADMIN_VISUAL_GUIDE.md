# 🎯 SuperAdmin System - Visual Guide

This document provides visual representations to help you understand the SuperAdmin system.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Hospital Management System                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Login Page    │
                    │  /login         │
                    └─────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │   Check User Role       │
                 └────────────┬────────────┘
                              │
      ┌───────────────────────┼───────────────────────┬──────────────┬──────────────┐
      │                       │                       │              │              │
      ▼                       ▼                       ▼              ▼              ▼
┌─────────┐            ┌──────────┐           ┌──────────┐   ┌──────────┐   ┌──────────┐
│SuperAdmin│           │  Admin   │           │  Doctor  │   │ Patient  │   │   Staff  │
│/superadmin│          │  /admin  │           │ /doctor  │   │ /patient │   │  /staff  │
└─────────┘            └──────────┘           └──────────┘   └──────────┘   └──────────┘
```

## 🏗️ Role Hierarchy

```
                    ┌─────────────────┐
                    │   SUPERADMIN    │
                    │  (Top Level)    │
                    └────────┬────────┘
                             │
                  Can Create/Delete/Change Password
                             │
                             ▼
                    ┌─────────────────┐
                    │     ADMIN       │
                    │  (Mid Level)    │
                    └────────┬────────┘
                             │
              Can Create/Delete/Manage All
                             │
        ┌────────────────────┼────────────────────┬────────────┐
        │                    │                    │            │
        ▼                    ▼                    ▼            ▼
  ┌──────────┐        ┌──────────┐        ┌──────────┐  ┌──────────┐
  │  DOCTOR  │        │ PATIENT  │        │  STAFF   │  │PHARMACIST│
  │ (End User)│       │(End User)│        │(End User)│  │(End User)│
  └──────────┘        └──────────┘        └──────────┘  └──────────┘
```

## 🔄 SuperAdmin Workflows

### Workflow 1: Creating an Admin

```
┌──────────────┐
│  SuperAdmin  │
│  Dashboard   │
└──────┬───────┘
       │
       │ Click "Add Admin"
       ▼
┌──────────────┐
│  Add Admin   │
│    Modal     │
└──────┬───────┘
       │
       │ Fill Form:
       │ • Name
       │ • Email
       │ • Phone
       │ • Password
       ▼
┌──────────────┐
│   Submit     │
│   Form       │
└──────┬───────┘
       │
       │ Call createUser()
       ▼
┌──────────────┐
│   Database   │
│  Insert New  │
│    Admin     │
└──────┬───────┘
       │
       │ Success
       ▼
┌──────────────┐
│ Admin Appears│
│   in Table   │
└──────────────┘
```

### Workflow 2: Changing Admin Password

```
┌──────────────┐
│  SuperAdmin  │
│  Dashboard   │
└──────┬───────┘
       │
       │ Click "Change Password"
       │ on specific Admin
       ▼
┌──────────────┐
│Change Password│
│    Modal      │
└──────┬────────┘
       │
       │ Enter new password
       │ (min 6 characters)
       ▼
┌──────────────┐
│   Submit     │
└──────┬───────┘
       │
       │ Call changeUserPassword()
       ▼
┌──────────────┐
│   Database   │
│    Update    │
│password_hash │
└──────┬───────┘
       │
       │ Success
       ▼
┌──────────────┐
│Success Message│
└──────────────┘
```

### Workflow 3: Deleting an Admin

```
┌──────────────┐
│  SuperAdmin  │
│  Dashboard   │
└──────┬───────┘
       │
       │ Click "Delete"
       │ on specific Admin
       ▼
┌──────────────┐
│ Confirmation │
│   Dialog     │
└──────┬───────┘
       │
       │ Confirm Delete
       ▼
┌──────────────┐
│   Database   │
│    DELETE    │
│    Query     │
└──────┬───────┘
       │
       │ Success
       ▼
┌──────────────┐
│ Refresh Table│
│  Remove Row  │
└──────────────┘
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────┐
│               USERS TABLE                   │
├──────────────┬─────────────┬────────────────┤
│    Field     │    Type     │  Constraint    │
├──────────────┼─────────────┼────────────────┤
│ id           │ UUID        │ PRIMARY KEY    │
│ email        │ TEXT        │ UNIQUE         │
│ password_hash│ TEXT        │ NOT NULL       │
│ role         │ TEXT        │ CHECK (...)    │
│ name         │ TEXT        │                │
│ phone        │ TEXT        │                │
│ created_at   │ TIMESTAMP   │ DEFAULT NOW()  │
└──────────────┴─────────────┴────────────────┘
                     │
         ┌───────────┴──────────────┐
         │   Role Constraint:       │
         │   • superadmin           │
         │   • admin                │
         │   • doctor               │
         │   • patient              │
         │   • pharmacist           │
         │   • staff                │
         └──────────────────────────┘
```

## 📋 Component Hierarchy

```
app/superadmin/page.tsx
│
├── Authentication Check
│   ├── getCurrentUser()
│   └── Role Verification
│
└── <AdminsView />
    │
    ├── State Management
    │   ├── admins []
    │   ├── showAddModal
    │   ├── showPasswordModal
    │   └── formData {}
    │
    ├── Data Fetching
    │   └── fetchAdmins()
    │
    ├── UI Components
    │   ├── Message Banner
    │   ├── Header with "Add Admin" button
    │   └── Admins Table
    │       ├── Name column
    │       ├── Email column
    │       ├── Phone column
    │       ├── Created At column
    │       └── Actions column
    │           ├── Change Password button
    │           └── Delete button
    │
    └── Modals
        ├── Add Admin Modal
        │   ├── Name input
        │   ├── Email input
        │   ├── Phone input
        │   ├── Password input
        │   └── Submit/Cancel buttons
        │
        └── Change Password Modal
            ├── Password input
            └── Submit/Cancel buttons
```

## 🔐 Authentication Flow

```
┌─────────────┐
│ User visits │
│   /login    │
└──────┬──────┘
       │
       │ Enter credentials
       ▼
┌─────────────┐
│   login()   │
│  function   │
└──────┬──────┘
       │
       │ Verify credentials
       ▼
┌─────────────┐      NO     ┌─────────────┐
│  Password   ├────────────►│ Show Error  │
│   Match?    │             └─────────────┘
└──────┬──────┘
       │ YES
       ▼
┌─────────────┐
│ Check Role  │
└──────┬──────┘
       │
       ├─ superadmin ──► /superadmin
       ├─ admin ───────► /admin
       ├─ doctor ──────► /doctor
       ├─ patient ─────► /patient
       ├─ pharmacist ──► /pharmacist
       └─ staff ───────► /staff
```

## 🎨 UI Layout

### SuperAdmin Dashboard Layout:

```
┌────────────────────────────────────────────────────┐
│  Super Admin Dashboard                             │
│  Manage hospital administrators                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Hospital Administrators       [+ Add Admin]       │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ Name    │ Email       │ Phone │ Created │ Actions  │
├─────────┼─────────────┼───────┼─────────┼──────────┤
│ John    │ john@h.com  │ 1234  │ Jan 1   │ [Change] │
│ Smith   │             │       │ 2025    │ [Delete] │
├─────────┼─────────────┼───────┼─────────┼──────────┤
│ Jane    │ jane@h.com  │ 5678  │ Jan 2   │ [Change] │
│ Doe     │             │       │ 2025    │ [Delete] │
└─────────┴─────────────┴───────┴─────────┴──────────┘
```

### Add Admin Modal:

```
        ┌─────────────────────────┐
        │   Add New Admin         │
        ├─────────────────────────┤
        │                         │
        │  Name:                  │
        │  [_________________]    │
        │                         │
        │  Email:                 │
        │  [_________________]    │
        │                         │
        │  Phone:                 │
        │  [_________________]    │
        │                         │
        │  Password:              │
        │  [_________________]    │
        │                         │
        │  [Create] [Cancel]      │
        └─────────────────────────┘
```

## 📱 User Journey Map

### Journey 1: First Time Setup

```
Step 1: Run Migrations
│
├─ 005_add_staff_and_rooms_system.sql
└─ 006_add_superadmin_role.sql
      │
      ▼
Step 2: Default SuperAdmin Created
│
├─ Email: superadmin@hospital.com
└─ Password: SuperAdmin@123
      │
      ▼
Step 3: Login as SuperAdmin
│
├─ Go to /login
└─ Enter default credentials
      │
      ▼
Step 4: Change Password (Security)
│
└─ Use forgot password or SQL update
      │
      ▼
Step 5: Create First Admin
│
├─ Click "Add Admin"
├─ Fill form
└─ Submit
      │
      ▼
Step 6: Admin Can Login
│
├─ Admin goes to /login
├─ Creates other users
└─ System is ready! ✓
```

## 🔢 Permission Matrix

```
┌──────────────┬────────────┬────────┬────────┬────────┬──────┐
│   Action     │ SuperAdmin │ Admin  │ Doctor │Patient │Staff │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Create Admin  │     ✓      │   ✗    │   ✗    │   ✗    │  ✗   │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Delete Admin  │     ✓      │   ✗    │   ✗    │   ✗    │  ✗   │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Change Admin  │     ✓      │   ✗    │   ✗    │   ✗    │  ✗   │
│Password      │            │        │        │        │      │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Create Doctor │     ✗      │   ✓    │   ✗    │   ✗    │  ✗   │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Create Patient│     ✗      │   ✓    │   ✗    │   ✗    │  ✓   │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│Create Staff  │     ✗      │   ✓    │   ✗    │   ✗    │  ✗   │
├──────────────┼────────────┼────────┼────────┼────────┼──────┤
│View All Users│     ✓      │   ✓    │   ✗    │   ✗    │  ✗   │
└──────────────┴────────────┴────────┴────────┴────────┴──────┘
```

## 🧩 Function Call Flow

### Creating an Admin:

```
User Input
    │
    ▼
handleAddAdmin()
    │
    ├─ Validate form data
    │
    ▼
createUser(email, password, 'admin', name, phone)
    │
    ├─ Hash password with bcrypt
    │
    ├─ Insert into users table
    │       ↓
    │   ┌─────────────┐
    │   │  Database   │
    │   │  (Supabase) │
    │   └─────────────┘
    │
    ▼
Return {success: true, message: "..."}
    │
    ▼
Update UI
    │
    ├─ Show success message
    ├─ Close modal
    └─ Refresh admin list
```

### Changing Password:

```
User Input
    │
    ▼
handleChangePassword()
    │
    ▼
changeUserPassword(userId, newPassword)
    │
    ├─ Hash new password with bcrypt
    │
    ├─ Update users table
    │       ↓
    │   ┌─────────────┐
    │   │  Database   │
    │   │  (Supabase) │
    │   └─────────────┘
    │
    ▼
Return {success: true, message: "..."}
    │
    ▼
Update UI
    │
    ├─ Show success message
    └─ Close modal
```

## 📊 State Management

### AdminsView Component State:

```
┌─────────────────────────────────────────┐
│           Component State               │
├─────────────────────────────────────────┤
│                                         │
│  admins: Admin[]                        │
│  ├─ Array of admin objects              │
│  └─ Fetched from database               │
│                                         │
│  loading: boolean                       │
│  ├─ true: Showing loader                │
│  └─ false: Showing content              │
│                                         │
│  showAddModal: boolean                  │
│  ├─ true: Modal visible                 │
│  └─ false: Modal hidden                 │
│                                         │
│  showPasswordModal: boolean             │
│  ├─ true: Modal visible                 │
│  └─ false: Modal hidden                 │
│                                         │
│  selectedAdmin: Admin | null            │
│  └─ Currently selected admin for actions│
│                                         │
│  message: {type, text} | null           │
│  ├─ type: 'success' | 'error'           │
│  └─ text: Message to display            │
│                                         │
│  formData: {name, email, phone, pass}   │
│  └─ Form input values                   │
│                                         │
│  newPassword: string                    │
│  └─ Password change input               │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Quick Reference

### Default Credentials:
```
Email: superadmin@hospital.com
Password: SuperAdmin@123
```

### Routes:
```
/login        → Login page
/superadmin   → SuperAdmin dashboard
/admin        → Admin dashboard
```

### Key Functions:
```
createUser()         → Create new user
changeUserPassword() → Change password
getCurrentUser()     → Get logged-in user
fetchAdmins()        → Get all admins
```

### Migration Files:
```
005_add_staff_and_rooms_system.sql
006_add_superadmin_role.sql
```

---

**This visual guide should help you understand how everything connects!** 🎉

For step-by-step instructions, see: `SUPERADMIN_SETUP_GUIDE.md`
For implementation details, see: `SUPERADMIN_IMPLEMENTATION.md`
