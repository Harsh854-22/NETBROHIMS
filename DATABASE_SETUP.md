# Database Setup Instructions

## Step 1: Set up Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/yfqgncfnnvdmthyrpnad
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire content from `database/migrations/001_initial_setup.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL commands

## Step 2: Get your Supabase Keys

1. In Supabase, go to "Project Settings" (gear icon in sidebar)
2. Click on "API" in the settings menu
3. Copy the following:
   - **Project URL** (e.g., `https://yfqgncfnnvdmthyrpnad.supabase.co`)
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys")

4. Update the `.env.local` file with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yfqgncfnnvdmthyrpnad.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   DATABASE_URL=postgresql://postgres:HIMS@123@db.yfqgncfnnvdmthyrpnad.supabase.co:5432/postgres
   ```

## Step 3: Default Admin Credentials

After running the migration, you'll have a default admin account:
- **Email**: admin@hospital.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password after first login!

## Database Tables Created

1. **users** - Stores all users (admin, doctors, patients)
2. **patients** - Additional patient information
3. **doctors** - Additional doctor information
4. **appointments** - Appointment bookings and their status

## Next Steps

After setting up the database:
1. Run `pnpm dev` to start the development server
2. Go to `http://localhost:3000/login`
3. Login with admin credentials
4. Start creating doctors and patients!
