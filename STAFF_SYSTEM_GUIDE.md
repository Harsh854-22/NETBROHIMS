# Staff Dashboard Guide

This guide explains the Staff Management system in NetBro HIMS.

## Overview

The Staff Dashboard provides hospital staff members with capabilities to manage:
- **Rooms**: Create and manage hospital rooms with availability tracking
- **Beds**: Assign beds to patients and track bed occupancy
- **Appointments**: Schedule and reschedule patient appointments
- **Patients**: Register new patients in the system

## Features

### 1. Room Management
Staff can manage hospital rooms with the following capabilities:

#### Room Types:
- General Ward
- Private Room
- ICU
- Emergency
- Surgery

#### Room Status:
- Available
- Occupied
- Maintenance
- Reserved

#### Actions:
- Add new rooms with room number, floor, type, and description
- Update room status and details
- Delete rooms
- Search and filter rooms by status and type

### 2. Bed Management
Manage individual beds within rooms:

#### Bed Status:
- Available
- Occupied
- Maintenance
- Reserved

#### Features:
- Assign beds to specific patients
- Track bed occupancy with patient information
- Set bed status (available, occupied, maintenance, reserved)
- Add notes for each bed
- Automatic assignment date tracking

### 3. Appointment Management
Handle patient appointments:

#### Capabilities:
- Schedule new appointments
- Reschedule existing appointments
- View all appointments with patient and doctor details
- Search appointments by patient, doctor, or reason

#### Limitations:
- Staff CANNOT create new doctors
- Staff can only schedule/reschedule appointments
- Cannot modify appointment status (pending, accepted, rejected, etc.)

### 4. Patient Management
Register new patients:

#### Patient Information:
- Full Name (required)
- Email (required)
- Phone
- Date of Birth
- Address
- Medical History

#### Features:
- Create new patient records
- View all registered patients
- Search patients by name, email, or phone

## Admin Control

### Creating Staff Members
Only administrators can create and manage staff accounts:

1. Login as admin
2. Go to Admin Dashboard
3. Click on "Staff" tab
4. Click "Add Staff Member"
5. Fill in staff details:
   - Full Name
   - Email
   - Phone (optional)
   - Password
6. Staff member can now login with their credentials

### Deleting Staff Members
Only administrators can remove staff members:

1. Go to Admin Dashboard → Staff tab
2. Find the staff member to remove
3. Click "Remove" button
4. Confirm deletion

## Database Schema

### Staff Users
Staff members are stored in the `users` table with `role = 'staff'`

### Rooms Table
```sql
- id (UUID)
- room_number (VARCHAR)
- room_type (VARCHAR) - general, private, icu, emergency, surgery
- floor (VARCHAR)
- description (TEXT)
- status (VARCHAR) - available, occupied, maintenance, reserved
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Beds Table
```sql
- id (UUID)
- room_id (UUID) - Foreign key to rooms
- bed_number (VARCHAR)
- status (VARCHAR) - available, occupied, maintenance, reserved
- patient_id (UUID) - Foreign key to patients (nullable)
- assigned_date (TIMESTAMP)
- discharge_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Access Control

### Staff Dashboard Access
- URL: `/staff`
- Authentication: Required
- Role: `staff` only
- Auto-redirect to login if not authenticated or wrong role

### Admin Dashboard Access
- Staff management: Admin only
- Full system control: Admin only

## Migration Setup

To add staff functionality to your database:

1. Run the migration script:
```bash
# Connect to your Supabase database or PostgreSQL
psql $DATABASE_URL -f database/migrations/005_add_staff_and_rooms_system.sql
```

This migration will:
- Add 'staff' to user roles
- Create rooms table
- Create beds table
- Add indexes for performance
- Add sample rooms (optional)

## Testing the System

### 1. Create a Staff Member (as Admin)
```
1. Login as admin
2. Go to Admin Dashboard
3. Navigate to Staff tab
4. Create new staff member
5. Use test credentials:
   - Email: staff@test.com
   - Password: staff123
```

### 2. Login as Staff
```
1. Logout from admin
2. Login with staff credentials
3. Access staff dashboard at /staff
```

### 3. Test Room Management
```
1. Add a new room
2. Update room status
3. Search and filter rooms
4. Delete a test room
```

### 4. Test Bed Management
```
1. Add beds to existing rooms
2. Assign a bed to a patient
3. Update bed status
4. View bed occupancy
```

### 5. Test Appointment Scheduling
```
1. Create a new appointment
2. Reschedule an existing appointment
3. Search for appointments
```

### 6. Test Patient Registration
```
1. Add a new patient
2. Fill in all patient details
3. Search for the patient
```

## Security Considerations

1. **Role-Based Access**: Staff can only access their dashboard
2. **Limited Permissions**: Staff cannot:
   - Create/edit doctors
   - Access admin functions
   - Modify other staff accounts
   - Change system settings

3. **Data Integrity**: 
   - Foreign key constraints ensure data consistency
   - Cascading deletes protect referential integrity
   - Status enums prevent invalid values

## UI/UX Features

### Theme Support
- Full dark/light mode support
- Consistent color scheme across all components
- Gradient accents using theme variables

### Responsive Design
- Mobile-friendly interface
- Adaptive grid layouts
- Touch-friendly buttons and controls

### Search and Filtering
- Real-time search across all views
- Status and type filters
- Instant results

### Visual Feedback
- Loading states
- Success/error messages
- Hover effects
- Color-coded status badges

## Troubleshooting

### Cannot Access Staff Dashboard
- Verify user role is set to 'staff' in database
- Check authentication status
- Clear browser cache and cookies

### Rooms/Beds Not Showing
- Run migration script 005
- Check database connection
- Verify tables exist in database

### Cannot Assign Patient to Bed
- Ensure patient exists in database
- Check bed status is set to 'occupied'
- Verify patient_id foreign key constraint

### Appointments Not Loading
- Verify doctors and patients exist
- Check appointments table relationships
- Review console for errors

## Future Enhancements

Potential features for future versions:
- Bed reservation system with time limits
- Room cleaning schedule management
- Bed transfer history
- Room occupancy statistics
- Automated bed assignment
- Patient discharge workflow
- Integration with billing system

## Support

For issues or questions:
1. Check this guide first
2. Review database migration logs
3. Check browser console for errors
4. Contact system administrator
