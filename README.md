# Hospital Management System - Simple Appointment Booking

A simple Next.js application for hospital appointment management with Admin, Doctor, and Patient roles.

## 🚀 Features

### Admin Features
- Create and manage doctors
- Create and manage patients  
- Schedule appointments for patients
- View all appointments and their status

### Doctor Features
- View all assigned appointments
- Accept or reject appointments
- Reschedule appointments
- Mark appointments as completed
- View patient medical history

### Patient Features
- View all their appointments
- See appointment status (pending, accepted, rejected, etc.)
- View doctor information

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js installed (v18 or higher)
- pnpm installed (`npm install -g pnpm`)
- A Supabase account (free tier is fine)

## 🛠️ Setup Instructions

### Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com/) and sign in
2. Your project URL: `https://yfqgncfnnvdmthyrpnad.supabase.co`
3. Go to SQL Editor in the Supabase dashboard
4. Copy the entire content from `database/migrations/001_initial_setup.sql`
5. Paste it into the SQL Editor and click **Run**

This will create all the necessary tables:
- `users` - All users (admin, doctors, patients)
- `doctors` - Doctor profiles
- `patients` - Patient profiles
- `appointments` - Appointment bookings

### Step 2: Environment Variables

The `.env.local` file has already been configured with your Supabase credentials:
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Supabase Service Role Key
- ✅ Database URL

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Start the Development Server

```bash
pnpm dev
```

The application will be available at: `http://localhost:3000`

## 🔐 Default Login Credentials

After running the database migration, you'll have a default admin account:

**Admin Account:**
- Email: `admin@hospital.com`
- Password: `admin123`

**⚠️ Important:** Change this password after first login!

## 📖 How to Use the Application

### For Admin:

1. Login with admin credentials
2. **Create Doctors:**
   - Go to "Doctors" tab
   - Click "Add Doctor"
   - Fill in doctor details (name, email, specialization, etc.)
   - Set a password for the doctor
   - Click "Create Doctor"

3. **Create Patients:**
   - Go to "Patients" tab
   - Click "Add Patient"
   - Fill in patient details (name, email, DOB, medical history, etc.)
   - Set a password for the patient
   - Click "Create Patient"

4. **Schedule Appointments:**
   - Go to "Appointments" tab
   - Click "Schedule Appointment"
   - Select a patient from the dropdown
   - Select a doctor from the dropdown
   - Choose date and time
   - Add reason for visit (optional)
   - Click "Schedule Appointment"

### For Doctors:

1. Login with doctor credentials (created by admin)
2. View all assigned appointments
3. For each appointment, you can:
   - **Accept** - Confirm the appointment
   - **Reject** - Reject with optional reason
   - **Reschedule** - Propose new date/time
   - **Mark Complete** - After the visit is done

4. Filter appointments by status:
   - All
   - Pending
   - Accepted
   - Completed

### For Patients:

1. Login with patient credentials (created by admin)
2. View all your appointments
3. See appointment status:
   - Pending (waiting for doctor confirmation)
   - Accepted (confirmed)
   - Rejected (with reason)
   - Rescheduled (with new timing)
   - Completed

## 🗂️ Project Structure

```
├── app/
│   ├── admin/          # Admin dashboard
│   ├── doctor/         # Doctor dashboard
│   ├── patient/        # Patient portal
│   ├── login/          # Login page
│   └── page.tsx        # Home page (redirects to login)
├── src/
│   └── lib/
│       ├── supabase.ts # Supabase client configuration
│       └── auth.ts     # Authentication functions
├── database/
│   └── migrations/     # SQL migration files
├── .env.local          # Environment variables (configured)
└── README.md           # This file
```

## 🔧 Troubleshooting

### "Can't connect to database"
- Make sure you ran the SQL migration in Supabase
- Check that `.env.local` has the correct keys
- Restart the dev server

### "User not found" when logging in
- Make sure you ran the SQL migration (includes default admin user)
- Check the Supabase SQL Editor for any errors

### "Error creating doctor/patient"
- Check the browser console for detailed error messages
- Make sure the email is unique (not already used)

## 📝 Database Schema

### Users Table
- id, email, name, role, phone, password_hash

### Patients Table
- id, user_id, date_of_birth, gender, address, medical_history

### Doctors Table
- id, user_id, specialization, qualification, experience_years

### Appointments Table
- id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes, created_by

## 🎯 Workflow Example

1. **Admin logs in** → Creates a doctor (Dr. Smith, Cardiologist)
2. **Patient visits hospital** → Admin creates patient account (John Doe)
3. **Admin schedules appointment** → Selects John Doe + Dr. Smith + Date/Time
4. **Dr. Smith logs in** → Sees new appointment notification
5. **Dr. Smith accepts** → Appointment status changes to "accepted"
6. **Patient logs in** → Sees confirmed appointment
7. **After visit** → Dr. Smith marks appointment as "completed"

## 🚀 Next Steps

To improve the application, you can add:
- Email notifications
- SMS reminders
- Calendar integration
- Medical records upload
- Prescription management
- Billing system

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Check the Supabase logs in the dashboard
3. Make sure all environment variables are correct

---

**Built with:**
- Next.js 15
- React 19
- Supabase
- TypeScript
- Tailwind CSS
