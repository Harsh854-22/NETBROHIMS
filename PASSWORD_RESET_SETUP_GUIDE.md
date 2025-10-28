# 🔐 Password Reset Setup Guide for Beginners

This guide will help you set up the password reset feature step by step. Don't worry, it's easier than it looks! 😊

---

## ✅ What We've Already Done

1. ✅ Created the login page with "Forgot Password" button
2. ✅ Created the reset password page (`/reset-password`)
3. ✅ Added password reset functions to the auth library

---

## 📋 What You Need to Do

### **Step 1: Configure Supabase Email Settings** (5 minutes)

#### 1.1 Go to Your Supabase Dashboard
1. Open your browser and go to: https://supabase.com
2. Click **"Sign In"** (top right)
3. Log in with your account
4. Click on your project: **yfqgncfnnvdmthyrpnad**

#### 1.2 Enable Email Authentication
1. In the left sidebar, click **"Authentication"**
2. Click **"Providers"** (under Authentication)
3. Find **"Email"** in the list
4. Make sure it's **ENABLED** (toggle should be ON/green)
5. Click **"Save"** if you made any changes

#### 1.3 Configure Email Templates
1. Still in **Authentication**, click **"Email Templates"** (left sidebar)
2. Click on **"Reset Password"** template
3. You'll see the email template - you can customize it if you want, or leave it as default
4. Make sure it's enabled
5. Click **"Save"**

#### 1.4 Set Up Site URL (Important!)
1. Still in **Authentication**, click **"URL Configuration"** (left sidebar)
2. Find **"Site URL"** field
3. Enter: `http://localhost:3001` (or your actual domain if deployed)
4. Find **"Redirect URLs"** section
5. Add these URLs (one per line):
   ```
   http://localhost:3001/reset-password
   http://localhost:3000/reset-password
   ```
6. Click **"Save"**

---

### **Step 2: Configure Email Provider** (10 minutes)

Supabase needs to know HOW to send emails. You have 2 options:

#### **Option A: Use Supabase's Built-in Email (Easy - Good for Testing)**

This is already set up! Supabase gives you free emails for testing.

⚠️ **Note**: These emails might go to spam, and there's a daily limit (30-50 emails/day).

**You're done with this step!** Skip to Step 3.

---

#### **Option B: Use Gmail SMTP (Better - Good for Production)**

If you want professional emails that don't go to spam:

1. **Create a Gmail App Password**:
   - Go to your Gmail account
   - Click your profile picture → **"Manage your Google Account"**
   - Go to **"Security"** (left sidebar)
   - Under "Signing in to Google", click **"2-Step Verification"** (you must enable this first)
   - Scroll down and click **"App passwords"**
   - Select **"Mail"** and **"Other"** (name it "Hospital System")
   - Click **"Generate"**
   - **Copy the 16-character password** (you'll need this!)

2. **Configure in Supabase**:
   - Go back to Supabase Dashboard
   - Click **"Project Settings"** (⚙️ icon, bottom left)
   - Click **"Auth"** tab
   - Scroll to **"SMTP Settings"**
   - Click **"Enable Custom SMTP"**
   - Fill in:
     - **Host**: `smtp.gmail.com`
     - **Port**: `587`
     - **Username**: `your-email@gmail.com`
     - **Password**: Paste the 16-character app password
     - **Sender email**: `your-email@gmail.com`
     - **Sender name**: `Hospital Management System`
   - Click **"Save"**

---

### **Step 3: Test the Password Reset** (2 minutes)

1. **Start your development server** (if not already running):
   ```powershell
   pnpm dev
   ```

2. **Open the login page**:
   - Go to: http://localhost:3001/login

3. **Click "Forgot your password?"**

4. **Enter an email address** that exists in your database:
   - For example: `admin@hospital.com`

5. **Click "Send Reset Link"**

6. **Check your email**:
   - Go to the email inbox
   - Look for an email from Supabase (might be in spam!)
   - Click the **"Reset Password"** link in the email

7. **You'll be redirected to the reset password page**:
   - Enter your new password (minimum 6 characters)
   - Confirm the password
   - Click **"Reset Password"**

8. **Success!** You'll be redirected to login
   - Try logging in with your new password

---

## 🎯 Quick Checklist

Before testing, make sure:

- [ ] ✅ Supabase Email provider is enabled
- [ ] ✅ Site URL is set to `http://localhost:3001`
- [ ] ✅ Redirect URLs include `/reset-password`
- [ ] ✅ Email template is configured
- [ ] ✅ Development server is running (`pnpm dev`)
- [ ] ✅ You have a test user in the database

---

## 🐛 Troubleshooting

### Problem: "Email not sent" or no email received

**Solutions**:
1. Check your spam folder
2. Wait 2-3 minutes (emails can be slow)
3. Try with a different email address
4. Check Supabase logs:
   - Go to Supabase Dashboard → **"Logs"** → **"Auth Logs"**
   - Look for errors

### Problem: "Invalid reset link"

**Solutions**:
1. Make sure the link is less than 1 hour old (they expire!)
2. Check that your redirect URLs are configured correctly
3. Try requesting a new reset link

### Problem: Reset link redirects to wrong page

**Solutions**:
1. Double-check the **Site URL** in Supabase settings
2. Make sure **Redirect URLs** include your reset-password page
3. Restart your dev server after making changes

---

## 📝 How It Works (Simple Explanation)

1. **User clicks "Forgot Password"** → Modal appears
2. **User enters email** → Clicks "Send Reset Link"
3. **System checks if email exists** → Sends magic link to email
4. **User clicks link in email** → Opens `/reset-password` page
5. **User enters new password** → System updates password
6. **Success!** → User can login with new password

---

## 🎨 What Files Were Created/Modified

```
app/
  ├── login/
  │   └── page.tsx              ← Updated (added forgot password modal)
  └── reset-password/
      └── page.tsx              ← NEW (password reset form)

src/
  └── lib/
      └── auth.ts               ← Updated (added reset functions)
```

---

## 🚀 Next Steps (Optional)

### Make it even better:

1. **Customize email template**:
   - Go to Supabase → Authentication → Email Templates
   - Add your hospital logo
   - Change the colors to match your brand

2. **Add rate limiting**:
   - Prevent users from spamming reset requests
   - Can be done with Supabase Edge Functions

3. **Add password strength meter**:
   - Show users how strong their password is
   - Require special characters, numbers, etc.

---

## ❓ Need Help?

If you get stuck:

1. **Check the browser console** (Press F12) for errors
2. **Check Supabase logs** (Dashboard → Logs)
3. **Read the error messages carefully** - they usually tell you what's wrong!
4. **Try the basic test first** - make sure simple things work before complex ones

---

## 🎉 Congratulations!

You now have a fully working password reset system! Your users can now:
- Request password reset via email
- Click a secure link to reset their password
- Login with their new password

Great job! 👏

---

**Last Updated**: October 27, 2025
**Difficulty Level**: Beginner-Friendly 😊
**Estimated Setup Time**: 15-20 minutes
