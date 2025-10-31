# Staff Dashboard - Quick Start Guide

## 🚀 Getting Started

### Step 1: Run the Database Migration
Run this SQL script in your Supabase SQL Editor or using psql:
```bash
database/migrations/005_add_staff_and_rooms_system.sql
```

This creates:
- Staff role support
- Rooms table
- Beds table
- Sample room data

### Step 2: Create a Staff Member (Admin Only)
1. Login as **admin**
2. Go to **Admin Dashboard**
3. Click **"Staff"** tab
4. Click **"Add Staff Member"**
5. Fill the form:
   - Name: Test Staff
   - Email: staff@test.com
   - Password: staff123
6. Click **"Create Staff"**

### Step 3: Login as Staff
1. **Logout** from admin
2. Go to login page
3. Enter staff credentials:
   - Email: staff@test.com
   - Password: staff123
4. You'll be redirected to `/staff`

---

## 🏥 Staff Dashboard Features

### Tab 1: Rooms 🏢
Manage hospital rooms with:
- **Room Types**: General Ward, Private, ICU, Emergency, Surgery
- **Status**: Available, Occupied, Maintenance, Reserved
- **Actions**: Create, Edit, Delete, Search, Filter

**Quick Test:**
1. Click **"Add Room"**
2. Enter:
   - Room Number: 201
   - Room Type: Private
   - Floor: 2
   - Status: Available
3. Click **"Create"**

### Tab 2: Beds 🛏️
Manage beds within rooms:
- **Bed Status**: Available, Occupied, Maintenance, Reserved
- **Patient Assignment**: Link beds to patients
- **Tracking**: Assignment dates, notes

**Quick Test:**
1. Click **"Add Bed"**
2. Select Room: 201
3. Bed Number: A1
4. Status: Available
5. Click **"Create"**
6. Edit bed → Change status to "Occupied"
7. Assign a patient

### Tab 3: Appointments 📅
Schedule and reschedule appointments:
- View all appointments
- Schedule new appointments
- Reschedule existing ones
- Search by patient/doctor

**Limitations:**
- ❌ Cannot create doctors
- ❌ Cannot change appointment status
- ✅ Can only schedule/reschedule

**Quick Test:**
1. Click **"Schedule Appointment"**
2. Select Patient (must exist)
3. Select Doctor (must exist)
4. Choose Date and Time
5. Add Reason
6. Click **"Schedule"**

### Tab 4: Patients 👥
Register new patients:
- Create patient records
- View patient details
- Search patients

**Limitations:**
- ❌ Cannot edit existing patients
- ❌ Cannot delete patients
- ✅ Can only create and view

**Quick Test:**
1. Click **"Add Patient"**
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +91 9876543210
   - Date of Birth: 1990-01-01
   - Address: Mumbai, India
3. Click **"Create Patient"**

---

## 🎨 UI Features

### Search & Filter
- Real-time search in all views
- Filter by status, type, etc.
- Instant results

### Color-Coded Status
- 🟢 Available: Green
- 🔴 Occupied: Red
- 🟡 Maintenance: Yellow
- 🔵 Reserved: Blue

### Theme Support
- 🌞 Light mode
- 🌙 Dark mode
- Toggle in header

---

## 👨‍💼 Admin Features

Admins can manage staff from **Admin Dashboard → Staff tab**:

### Create Staff
1. Click **"Add Staff Member"**
2. Enter details
3. Staff can login immediately

### Delete Staff
1. Find staff member
2. Click **"Remove"**
3. Confirm deletion

---

## 🔐 Access Control

| Feature | Staff | Admin |
|---------|:-----:|:-----:|
| View/Edit Rooms | ✅ | ✅ |
| View/Edit Beds | ✅ | ✅ |
| Schedule Appointments | ✅ | ✅ |
| Create Patients | ✅ | ✅ |
| **Create Doctors** | ❌ | ✅ |
| **Edit Patients** | ❌ | ✅ |
| **Manage Staff** | ❌ | ✅ |
| **System Settings** | ❌ | ✅ |

---

## 🗄️ Database Schema

### Rooms Table
```
id              UUID (Primary Key)
room_number     VARCHAR (Unique)
room_type       VARCHAR (general/private/icu/emergency/surgery)
floor           VARCHAR
description     TEXT
status          VARCHAR (available/occupied/maintenance/reserved)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Beds Table
```
id              UUID (Primary Key)
room_id         UUID (Foreign Key → rooms.id)
bed_number      VARCHAR
status          VARCHAR (available/occupied/maintenance/reserved)
patient_id      UUID (Foreign Key → patients.id, nullable)
assigned_date   TIMESTAMP
discharge_date  TIMESTAMP
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Users Table (Updated)
```
role            VARCHAR (admin/doctor/patient/pharmacist/staff) ← Added 'staff'
```

---

## ⚡ Quick Commands

### Check if migration ran successfully:
```sql
-- In Supabase SQL Editor
SELECT * FROM rooms LIMIT 5;
SELECT * FROM beds LIMIT 5;
SELECT * FROM users WHERE role = 'staff';
```

### Manually add a staff user:
```sql
-- After hashing password with bcrypt
INSERT INTO users (email, name, role, password_hash, phone)
VALUES ('staff@test.com', 'Test Staff', 'staff', '$2a$10$...', '+91 9876543210');
```

---

## 🎯 Common Use Cases

### Morning Routine (Staff)
1. Check room availability
2. Assign beds to new patients
3. Schedule today's appointments
4. Register walk-in patients

### Admin Tasks
1. Create new staff members
2. Monitor staff activity
3. Review room/bed utilization
4. System management

---

## 🐛 Troubleshooting

### "Cannot access staff dashboard"
- ✓ Check user role is 'staff' in database
- ✓ Try logging out and in again
- ✓ Clear browser cache

### "Rooms/Beds not showing"
- ✓ Run migration script
- ✓ Check database connection
- ✓ Verify tables exist

### "Cannot assign patient to bed"
- ✓ Ensure patient exists
- ✓ Set bed status to 'occupied'
- ✓ Check bed is not already occupied

---

## 📚 Additional Resources

- **Full Documentation**: `STAFF_SYSTEM_GUIDE.md`
- **Implementation Details**: `STAFF_IMPLEMENTATION_SUMMARY.md`
- **Migration Script**: `database/migrations/005_add_staff_and_rooms_system.sql`

---

## ✅ Testing Checklist

Before going live:

- [ ] Migration ran successfully
- [ ] Can create staff user (admin)
- [ ] Can login as staff
- [ ] Can create/edit rooms
- [ ] Can create/edit beds
- [ ] Can assign patients to beds
- [ ] Can schedule appointments
- [ ] Can register new patients
- [ ] Search/filter works in all views
- [ ] Theme toggle works
- [ ] Responsive on mobile
- [ ] Access control works (staff cannot access admin features)

---

## 🎉 Success!

You now have a fully functional staff dashboard with:
- ✅ Room management
- ✅ Bed management  
- ✅ Appointment scheduling
- ✅ Patient registration
- ✅ Admin control over staff
- ✅ Professional UI
- ✅ Mobile responsive
- ✅ Dark/Light themes

**Happy Managing! 🏥**
