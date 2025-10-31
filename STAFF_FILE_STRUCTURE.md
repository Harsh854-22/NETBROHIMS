# Staff System - File Structure

## 📁 Project Structure

```
NetBro-HIMS/
│
├── 📂 app/
│   ├── 📂 admin/
│   │   └── page.tsx (✏️ Modified - Added staff tab)
│   ├── 📂 login/
│   │   └── page.tsx (✏️ Modified - Added staff routing)
│   └── 📂 staff/ (✨ NEW)
│       └── page.tsx (✨ NEW - Staff dashboard main page)
│
├── 📂 components/
│   ├── Icons.tsx (✏️ Modified - Added bed icon)
│   ├── 📂 admin/
│   │   └── StaffView.tsx (✨ NEW - Admin staff management)
│   └── 📂 staff/ (✨ NEW FOLDER)
│       ├── RoomsView.tsx (✨ NEW - Room management)
│       ├── BedsView.tsx (✨ NEW - Bed management)
│       ├── AppointmentsView.tsx (✨ NEW - Appointment scheduling)
│       └── PatientsView.tsx (✨ NEW - Patient registration)
│
├── 📂 database/
│   └── 📂 migrations/
│       └── 005_add_staff_and_rooms_system.sql (✨ NEW - Database schema)
│
├── 📂 lib/
│   └── auth.ts (✏️ Modified - Added staff role support)
│
└── 📂 docs/
    ├── STAFF_SYSTEM_GUIDE.md (✨ NEW - Full documentation)
    ├── STAFF_IMPLEMENTATION_SUMMARY.md (✨ NEW - Implementation details)
    ├── STAFF_QUICK_START.md (✨ NEW - Quick start guide)
    └── STAFF_FILE_STRUCTURE.md (This file)
```

## 📝 File Details

### ✨ NEW FILES (9 files)

#### 1. Database Migration
```
📄 database/migrations/005_add_staff_and_rooms_system.sql
   Purpose: Database schema for staff, rooms, and beds
   Lines: ~200
   Creates: rooms table, beds table, staff role, indexes
```

#### 2. Staff Dashboard Page
```
📄 app/staff/page.tsx
   Purpose: Main staff dashboard with navigation
   Lines: ~160
   Features: Authentication, role check, 4-tab navigation
   Routes: /staff
```

#### 3. Staff Components

```
📄 components/staff/RoomsView.tsx
   Purpose: Room management interface
   Lines: ~380
   Features: CRUD operations, search, filters, status management
   
📄 components/staff/BedsView.tsx
   Purpose: Bed management interface
   Lines: ~410
   Features: CRUD operations, patient assignment, occupancy tracking
   
📄 components/staff/AppointmentsView.tsx
   Purpose: Appointment scheduling interface
   Lines: ~420
   Features: Schedule/reschedule, view appointments, search
   
📄 components/staff/PatientsView.tsx
   Purpose: Patient registration interface
   Lines: ~260
   Features: Create patients, view list, search
```

#### 4. Admin Component
```
📄 components/admin/StaffView.tsx
   Purpose: Admin interface for managing staff users
   Lines: ~280
   Features: Create/delete staff, search, view list
```

#### 5. Documentation Files
```
📄 STAFF_SYSTEM_GUIDE.md
   Purpose: Comprehensive system documentation
   Lines: ~450
   Sections: Features, setup, database, security, troubleshooting
   
📄 STAFF_IMPLEMENTATION_SUMMARY.md
   Purpose: Implementation overview and summary
   Lines: ~350
   Sections: What was created, features, access control, testing
   
📄 STAFF_QUICK_START.md
   Purpose: Quick setup and usage guide
   Lines: ~300
   Sections: Getting started, features, testing, troubleshooting
```

### ✏️ MODIFIED FILES (4 files)

#### 1. Authentication Library
```
📄 lib/auth.ts
   Changes: 
   - Added 'staff' to User type
   - Updated createUser function to support staff role
   Lines Modified: ~10
```

#### 2. Admin Page
```
📄 app/admin/page.tsx
   Changes:
   - Imported StaffView component
   - Added 'staff' to activeTab type
   - Added staff navigation button
   - Added staff content section
   Lines Modified: ~25
```

#### 3. Login Page
```
📄 app/login/page.tsx
   Changes:
   - Added staff role routing condition
   - Routes to /staff for staff users
   Lines Modified: ~5
```

#### 4. Icons Component
```
📄 components/Icons.tsx
   Changes:
   - Added bed icon SVG
   Lines Modified: ~6
```

## 📊 Statistics

### Code Metrics
```
Total Files Created:     9
Total Files Modified:    4
Total Lines Added:      ~2,800
Total Lines Modified:   ~46

Breakdown by Type:
- TypeScript/TSX:       ~2,100 lines
- SQL:                  ~200 lines
- Documentation:        ~1,100 lines
```

### Component Breakdown
```
Staff Components:        4 files (~1,470 lines)
Admin Components:        1 file (~280 lines)
Pages:                   1 file (~160 lines)
Database:                1 file (~200 lines)
Documentation:           3 files (~1,100 lines)
Library Updates:         4 files (~46 lines)
```

## 🎯 Component Dependencies

```
app/staff/page.tsx
├── uses → components/staff/RoomsView.tsx
├── uses → components/staff/BedsView.tsx
├── uses → components/staff/AppointmentsView.tsx
├── uses → components/staff/PatientsView.tsx
├── uses → components/Icons.tsx
├── uses → components/ThemeToggle.tsx
├── uses → lib/auth.ts
└── uses → lib/supabase.ts

app/admin/page.tsx
├── uses → components/admin/StaffView.tsx (NEW)
└── ... (existing admin components)

components/admin/StaffView.tsx
├── uses → lib/supabase.ts
├── uses → lib/auth.ts (createUser)
└── uses → components/Icons.tsx

components/staff/*.tsx (all)
├── uses → lib/supabase.ts
└── uses → components/Icons.tsx
```

## 🗄️ Database Dependencies

```
Migration: 005_add_staff_and_rooms_system.sql
├── Modifies → users table (adds 'staff' role)
├── Creates → rooms table
└── Creates → beds table
    ├── FK → rooms.id
    └── FK → patients.id

Relationships:
users (role='staff') → Staff members
rooms → Multiple beds
beds → One room, One patient (optional)
```

## 🔗 Route Structure

```
Public Routes:
├── /login → app/login/page.tsx

Protected Routes:
├── /admin → app/admin/page.tsx
│   └── Accessible by: role='admin'
│
├── /staff → app/staff/page.tsx (NEW)
│   └── Accessible by: role='staff'
│
├── /doctor → app/doctor/page.tsx
│   └── Accessible by: role='doctor'
│
├── /patient → app/patient/page.tsx
│   └── Accessible by: role='patient'
│
└── /pharmacist → app/pharmacist/page.tsx
    └── Accessible by: role='pharmacist'
```

## 📦 Feature Modules

### Room Management Module
```
Files:
- components/staff/RoomsView.tsx
- database/migrations/005...sql (rooms table)

Capabilities:
- Create/Read/Update/Delete rooms
- Filter by type and status
- Search functionality
```

### Bed Management Module
```
Files:
- components/staff/BedsView.tsx
- database/migrations/005...sql (beds table)

Capabilities:
- Create/Read/Update/Delete beds
- Assign patients
- Track occupancy
```

### Appointment Module (Staff Limited)
```
Files:
- components/staff/AppointmentsView.tsx

Capabilities:
- Schedule new appointments
- Reschedule appointments
- View appointments
- Search appointments
```

### Patient Module (Staff Limited)
```
Files:
- components/staff/PatientsView.tsx

Capabilities:
- Create patients
- View patient list
- Search patients
```

### Staff Management Module (Admin Only)
```
Files:
- components/admin/StaffView.tsx

Capabilities:
- Create staff users
- Delete staff users
- View staff list
- Search staff
```

## 🎨 UI Component Structure

### Common UI Patterns
```
All Views Follow:
├── Header Section
│   ├── Title & Description
│   └── Action Button (Add/Create)
├── Search/Filter Section
│   ├── Search Input
│   └── Filter Dropdowns
├── Content Section
│   ├── Grid/List Layout
│   └── Item Cards
└── Modal Section
    ├── Form
    └── Action Buttons
```

### Shared Components Used
```
- Icons (from components/Icons.tsx)
- ThemeToggle (from components/ThemeToggle.tsx)
- No shared form/modal components (could be extracted for DRY)
```

## 🔧 Configuration Files

### TypeScript Configuration
```
tsconfig.json (no changes needed)
- Paths already configured with @/
```

### Environment Variables
```
.env.local (no changes needed)
- Uses existing DATABASE_URL
- Uses existing Supabase config
```

## 📚 Documentation Structure

```
STAFF_SYSTEM_GUIDE.md
├── Overview
├── Features (detailed)
├── Database Schema
├── Access Control
├── Migration Setup
├── Testing
├── Security
├── UI/UX
├── Troubleshooting
└── Future Enhancements

STAFF_IMPLEMENTATION_SUMMARY.md
├── What Was Created
├── Key Features
├── Access Control Matrix
├── Database Structure
├── How to Use
├── Setup Instructions
├── Files Modified/Created
└── Testing Checklist

STAFF_QUICK_START.md
├── Getting Started (3 steps)
├── Dashboard Features (4 tabs)
├── UI Features
├── Admin Features
├── Access Control Matrix
├── Database Schema
├── Quick Commands
├── Common Use Cases
├── Troubleshooting
└── Testing Checklist
```

## 🚀 Deployment Checklist

Before deploying:
- [ ] Run migration: 005_add_staff_and_rooms_system.sql
- [ ] Verify tables created (rooms, beds)
- [ ] Verify user role constraint updated
- [ ] Test staff user creation
- [ ] Test staff login and access
- [ ] Test all CRUD operations
- [ ] Verify access control
- [ ] Check responsive design
- [ ] Test theme switching
- [ ] Review documentation

## 🎯 Quick Reference

### To Add a New Feature to Staff Dashboard:
1. Create component in `components/staff/`
2. Import in `app/staff/page.tsx`
3. Add tab button in navigation
4. Add conditional render in content section
5. Update documentation

### To Modify Staff Permissions:
1. Update `app/staff/page.tsx` checkAuth()
2. Update access control in component
3. Update documentation in STAFF_SYSTEM_GUIDE.md

### To Add New Database Table:
1. Create migration in `database/migrations/`
2. Run migration
3. Create corresponding component
4. Update types in TypeScript
5. Document in guide

---

**Total Implementation**: 9 new files, 4 modified files, ~2,800 lines of code + documentation
