# 🔄 Password Reset Flow - Visual Guide

## How the Password Reset Works (Step by Step)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER FORGOT PASSWORD                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: User Goes to Login Page                                │
│  ┌──────────────────────────────────────────────┐              │
│  │  Login Page                                   │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │  Email: ____________________          │ │              │
│  │  │  Password: _________________          │ │              │
│  │  │  [Sign In]                             │ │              │
│  │  │                                        │ │              │
│  │  │  👇 Forgot your password?              │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Modal Popup Appears                                    │
│  ┌──────────────────────────────────────────────┐              │
│  │  Reset Password Modal                        │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │  Enter your email to receive a         │ │              │
│  │  │  password reset link                   │ │              │
│  │  │                                        │ │              │
│  │  │  Email: admin@hospital.com            │ │              │
│  │  │                                        │ │              │
│  │  │  [Cancel]  [Send Reset Link]          │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: System Sends Email                                     │
│                                                                  │
│  Frontend (Your App)                                            │
│      │                                                           │
│      │ 1. Calls sendPasswordResetEmail()                       │
│      ▼                                                           │
│  Auth Library (src/lib/auth.ts)                                │
│      │                                                           │
│      │ 2. Checks if user exists in database                    │
│      │ 3. Calls Supabase Auth API                              │
│      ▼                                                           │
│  Supabase                                                       │
│      │                                                           │
│      │ 4. Generates secure reset token                         │
│      │ 5. Sends email via SMTP                                 │
│      ▼                                                           │
│  User's Email Inbox                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: User Receives Email                                    │
│  ┌──────────────────────────────────────────────┐              │
│  │  📧 Email from Hospital Management System    │              │
│  │  ─────────────────────────────────────────── │              │
│  │  Hi there,                                   │              │
│  │                                               │              │
│  │  We received a request to reset your         │              │
│  │  password. Click the link below:             │              │
│  │                                               │              │
│  │  👉 [Reset Your Password]                    │              │
│  │                                               │              │
│  │  This link expires in 1 hour.                │              │
│  │                                               │              │
│  │  If you didn't request this, ignore it.      │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: User Clicks Link → Opens Reset Password Page          │
│  ┌──────────────────────────────────────────────┐              │
│  │  Reset Password Page                         │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │  Enter your new password below         │ │              │
│  │  │                                        │ │              │
│  │  │  New Password: ____________________   │ │              │
│  │  │  Confirm: _________________________   │ │              │
│  │  │                                        │ │              │
│  │  │  ✅ At least 6 characters              │ │              │
│  │  │  ✅ Passwords match                    │ │              │
│  │  │                                        │ │              │
│  │  │  [Reset Password]                      │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Password is Updated                                    │
│                                                                  │
│  Reset Password Page                                            │
│      │                                                           │
│      │ 1. Validates passwords match                            │
│      │ 2. Calls resetPassword()                                │
│      ▼                                                           │
│  Auth Library                                                   │
│      │                                                           │
│      │ 3. Hashes new password with bcrypt                      │
│      │ 4. Updates password_hash in database                    │
│      ▼                                                           │
│  Database (Supabase)                                            │
│      │                                                           │
│      │ 5. Password updated successfully                        │
│      ▼                                                           │
│  Success!                                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: User is Redirected to Login                           │
│  ┌──────────────────────────────────────────────┐              │
│  │  ✅ Success!                                  │              │
│  │  Password updated successfully.               │              │
│  │  Please login with your new password.         │              │
│  │                                               │              │
│  │  Redirecting to login in 3 seconds...        │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: User Can Login with New Password                      │
│  ┌──────────────────────────────────────────────┐              │
│  │  Login Page                                   │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │  Email: admin@hospital.com            │ │              │
│  │  │  Password: [new password]             │ │              │
│  │  │  [Sign In] ✅                          │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Features

### What Makes This Secure?

1. **🔒 Password Hashing**
   - Passwords are NEVER stored as plain text
   - We use bcrypt with salt rounds
   - Even if database is hacked, passwords are safe

2. **⏰ Time-Limited Links**
   - Reset links expire after 1 hour
   - Old links automatically become invalid
   - Prevents abuse

3. **🎯 One-Time Use**
   - Each reset link can only be used once
   - After password is changed, link becomes invalid

4. **🔍 Email Verification**
   - Only works with emails that exist in database
   - User must have access to their email
   - Confirms identity

5. **🚫 No Password Hints**
   - System never reveals if email exists or not
   - Same message for valid and invalid emails
   - Prevents email enumeration attacks

## 📁 Files Involved

### Frontend Files:
```
app/
├── login/page.tsx          ← Has "Forgot Password" button + modal
└── reset-password/page.tsx ← New password entry form
```

### Backend/Logic Files:
```
src/lib/
└── auth.ts                 ← Password reset functions
```

### Configuration:
```
Supabase Dashboard
├── Authentication
│   ├── Providers (Email enabled)
│   ├── Email Templates (Reset Password)
│   └── URL Configuration (Redirect URLs)
└── Project Settings
    └── Auth (SMTP Settings - optional)
```

## 🎯 Quick Test Steps

1. **Go to**: http://localhost:3001/login
2. **Click**: "Forgot your password?"
3. **Enter**: admin@hospital.com
4. **Click**: "Send Reset Link"
5. **Check**: Your email inbox (or spam!)
6. **Click**: The reset link in the email
7. **Enter**: Your new password (twice)
8. **Click**: "Reset Password"
9. **Done!**: Login with new password

## 💡 Pro Tips

- **For Testing**: Use a real email you have access to
- **Check Spam**: Reset emails often go to spam folder
- **Wait a Bit**: Emails can take 1-2 minutes to arrive
- **Link Expires**: Use the link within 1 hour
- **Strong Passwords**: Use at least 6 characters

## ❓ Common Questions

**Q: Where is the password stored?**
A: In the `users` table, in the `password_hash` column (encrypted!)

**Q: Can I customize the email?**
A: Yes! Go to Supabase → Authentication → Email Templates

**Q: What if user doesn't receive email?**
A: Check spam, wait 2-3 minutes, or set up Gmail SMTP

**Q: Is this secure?**
A: Yes! We use industry-standard security practices

**Q: Can users reset password multiple times?**
A: Yes! Each request generates a new link

---

**Happy Coding! 🚀**
