# 🎯 BEGINNER'S GUIDE: Setting Up Your Database

## Don't worry! Follow these simple steps exactly as written:

---

## 📍 STEP 1: Open Supabase in Your Browser

1. Open your web browser (Chrome, Edge, or Firefox)
2. Copy this link and paste it in your browser:
   ```
   https://supabase.com/dashboard/project/yfqgncfnnvdmthyrpnad
   ```
3. Press Enter
4. **If asked to login**: Use your Supabase account credentials

---

## 📍 STEP 2: Go to SQL Editor

Once you're on the Supabase dashboard:

1. Look at the **LEFT SIDEBAR** (the menu on the left side)
2. Find and click on **"SQL Editor"** 
   - It has a database/document icon 📄
   - It's usually near the middle of the sidebar

You should now see a screen with a large text box where you can write SQL code.

---

## 📍 STEP 3: Open the SQL Migration File

1. Go back to VS Code (your code editor)
2. In the file explorer on the left, find this file:
   ```
   database → migrations → 001_initial_setup.sql
   ```
3. Click on it to open it
4. You'll see a lot of SQL code (starting with "CREATE TABLE...")

---

## 📍 STEP 4: Copy All the SQL Code

1. Click anywhere inside the SQL file
2. Press **Ctrl + A** (this selects all the text)
3. Press **Ctrl + C** (this copies the text)

**OR** you can:
- Click at the very top of the file
- Scroll down to the very bottom while holding Shift
- Then press Ctrl + C

---

## 📍 STEP 5: Paste the Code in Supabase

1. Go back to your browser (Supabase SQL Editor tab)
2. Click inside the big text box
3. Press **Ctrl + V** (this pastes the SQL code)
4. You should now see all the SQL code in the editor

---

## 📍 STEP 6: Run the SQL Code

1. Look for a **"Run"** button (usually at the bottom right or top right)
   - It might say "Run" or have a play icon ▶️
2. Click the **"Run"** button
3. Wait a few seconds...

---

## 📍 STEP 7: Check if it Worked

After clicking Run, you should see one of these messages:

✅ **Success! If you see:**
- "Success. No rows returned" - PERFECT! ✓
- "Success" - PERFECT! ✓
- No error messages - PERFECT! ✓

❌ **Error! If you see:**
- "relation already exists" - This means tables are already created. That's OK!
- Any other error - Take a screenshot and ask for help

---

## 📍 STEP 8: Verify Your Tables Were Created

Let's check if the tables are really there:

1. In the Supabase sidebar, click on **"Table Editor"** (looks like a table icon)
2. You should now see these 4 tables:
   - ✓ users
   - ✓ patients
   - ✓ doctors
   - ✓ appointments

If you see all 4 tables, **CONGRATULATIONS!** 🎉 Your database is ready!

---

## 📍 STEP 9: Test Your Application

Now let's see if everything works:

1. Go back to your browser
2. Open a new tab and go to:
   ```
   http://localhost:3000
   ```
3. You should see a login page

---

## 📍 STEP 10: Login to the Application

On the login page:

1. **Email:** Type exactly this (including @):
   ```
   admin@hospital.com
   ```

2. **Password:** Type exactly this:
   ```
   admin123
   ```

3. Click the **"Sign in"** button

---

## ✅ SUCCESS!

If you logged in successfully, you should see the **Admin Dashboard**!

From here you can:
- Click "Doctors" tab → Add a new doctor
- Click "Patients" tab → Add a new patient  
- Click "Appointments" tab → Schedule an appointment

---

## ❓ TROUBLESHOOTING

### Problem: "Invalid email or password"
**Solution:** 
- Make sure you ran the SQL migration (Steps 1-7)
- Check that you typed the email and password exactly as shown above
- No extra spaces!

### Problem: Can't see the login page
**Solution:**
- Make sure your dev server is running
- In VS Code terminal, you should see "Ready in X seconds"
- If not, run: `pnpm dev`

### Problem: Database connection error
**Solution:**
- Check your `.env.local` file has the Supabase keys
- Make sure your internet connection is working

---

## 🎓 WHAT YOU JUST DID

You successfully:
1. ✅ Connected to your Supabase database
2. ✅ Created database tables (users, doctors, patients, appointments)
3. ✅ Created a default admin account
4. ✅ Logged into your application

**You're now ready to use the Hospital Management System!** 🏥

---

## 📚 NEXT LEARNING STEPS

Now that it's working, try:
1. Creating your first doctor
2. Creating your first patient
3. Scheduling an appointment
4. Login as the doctor to see the appointment
5. Accept the appointment as the doctor

**Have fun!** 🎉
