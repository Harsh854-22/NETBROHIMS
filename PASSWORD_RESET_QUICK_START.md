# ✅ Password Reset Quick Start Checklist

## Before You Start
- [ ] I have my Supabase account login ready
- [ ] I know my Supabase project URL: `yfqgncfnnvdmthyrpnad.supabase.co`
- [ ] My development server is running (`pnpm dev`)

---

## 🚀 Quick Setup (15 minutes)

### Part 1: Supabase Configuration (10 min)

#### Step 1: Login to Supabase
- [ ] 1. Go to https://supabase.com
- [ ] 2. Click "Sign In"
- [ ] 3. Open your project: `yfqgncfnnvdmthyrpnad`

#### Step 2: Enable Email Authentication
- [ ] 1. Click "Authentication" (left sidebar)
- [ ] 2. Click "Providers"
- [ ] 3. Make sure "Email" is **ENABLED** (green toggle)
- [ ] 4. Click "Save"

#### Step 3: Configure URLs
- [ ] 1. Click "URL Configuration" (under Authentication)
- [ ] 2. Set **Site URL** to: `http://localhost:3001`
- [ ] 3. Add to **Redirect URLs**:
  ```
  http://localhost:3001/reset-password
  http://localhost:3000/reset-password
  ```
- [ ] 4. Click "Save"

#### Step 4: Check Email Template
- [ ] 1. Click "Email Templates" (under Authentication)
- [ ] 2. Click "Reset Password"
- [ ] 3. Make sure it's enabled
- [ ] 4. You can leave the default template or customize it
- [ ] 5. Click "Save"

### Part 2: Test It! (5 min)

#### Step 1: Start Your App
```powershell
# If not already running:
pnpm dev
```
- [ ] Server is running on http://localhost:3001

#### Step 2: Test Password Reset
- [ ] 1. Open: http://localhost:3001/login
- [ ] 2. Click "Forgot your password?"
- [ ] 3. Enter: `admin@hospital.com`
- [ ] 4. Click "Send Reset Link"
- [ ] 5. See success message

#### Step 3: Check Email
- [ ] 1. Go to the email inbox for `admin@hospital.com`
- [ ] 2. Look for email from Supabase (check spam!)
- [ ] 3. Email should arrive within 1-2 minutes

#### Step 4: Reset Password
- [ ] 1. Click the "Reset Password" link in the email
- [ ] 2. You should be redirected to: http://localhost:3001/reset-password
- [ ] 3. Enter new password (min 6 characters)
- [ ] 4. Confirm password
- [ ] 5. Click "Reset Password"
- [ ] 6. See success message

#### Step 5: Login with New Password
- [ ] 1. Wait 3 seconds (auto-redirect) or click "Back to Login"
- [ ] 2. Login with: `admin@hospital.com` and your NEW password
- [ ] 3. You should be redirected to the admin dashboard

---

## ✅ Success Criteria

You'll know it's working when:

- [x] ✅ Login page has "Forgot your password?" link
- [x] ✅ Clicking it shows a modal popup
- [x] ✅ Email is sent when you click "Send Reset Link"
- [x] ✅ Reset link in email opens the reset password page
- [x] ✅ New password is accepted and saved
- [x] ✅ You can login with the new password

---

## 🐛 Troubleshooting

### Problem: "Email not received"

**Check:**
1. [ ] Is email in spam folder?
2. [ ] Did you wait 2-3 minutes?
3. [ ] Is the email address correct and exists in database?
4. [ ] Check Supabase Dashboard → Logs → Auth Logs for errors

**Fix:**
- Try with a different email address
- Check email provider settings in Supabase
- Make sure Email provider is enabled

### Problem: "Invalid reset link"

**Check:**
1. [ ] Is the link less than 1 hour old?
2. [ ] Are redirect URLs configured correctly?
3. [ ] Is Site URL set correctly?

**Fix:**
- Request a new reset link
- Double-check URL configuration in Supabase
- Restart your dev server

### Problem: "Reset password page not found (404)"

**Check:**
1. [ ] Does file exist? `app/reset-password/page.tsx`
2. [ ] Is dev server running?
3. [ ] Are there any TypeScript errors?

**Fix:**
- Make sure all files were created
- Run `pnpm dev` again
- Check terminal for errors

---

## 📝 Files Created/Modified

### New Files:
- ✅ `app/reset-password/page.tsx` - Reset password form
- ✅ `PASSWORD_RESET_SETUP_GUIDE.md` - Detailed setup guide
- ✅ `PASSWORD_RESET_FLOW.md` - Visual flow diagram
- ✅ `PASSWORD_RESET_QUICK_START.md` - This file!

### Modified Files:
- ✅ `app/login/page.tsx` - Added forgot password modal
- ✅ `src/lib/auth.ts` - Added reset password functions

---

## 🎯 What's Next?

After completing this checklist:

### Optional Improvements:
1. **Set up Gmail SMTP** (for production-ready emails)
   - See: `PASSWORD_RESET_SETUP_GUIDE.md` → Step 2 → Option B
   
2. **Customize email template**
   - Add your hospital logo
   - Change colors to match your brand
   - Go to: Supabase → Authentication → Email Templates

3. **Test with real users**
   - Create more test accounts
   - Have someone else try it
   - Get feedback

### Production Deployment:
When you deploy to production:
1. [ ] Update Site URL to your production domain
2. [ ] Update Redirect URLs to your production domain
3. [ ] Set up professional email (Gmail SMTP or SendGrid)
4. [ ] Test thoroughly before going live

---

## 💡 Pro Tips

- **Always test with a real email** you have access to
- **Keep your Supabase dashboard open** to check logs
- **Use the browser console** (F12) to see any errors
- **Read error messages carefully** - they tell you what's wrong!
- **Test the whole flow** from start to finish

---

## 📚 Need More Help?

1. **Detailed Setup**: Read `PASSWORD_RESET_SETUP_GUIDE.md`
2. **Understand Flow**: Read `PASSWORD_RESET_FLOW.md`
3. **Supabase Docs**: https://supabase.com/docs/guides/auth
4. **Common Issues**: Check the Troubleshooting section above

---

## ✨ You're All Set!

Once you check all the boxes above, your password reset feature is ready to use!

**Estimated Time**: 15-20 minutes
**Difficulty**: Beginner-Friendly 😊

Good luck! 🚀

---

**Last Updated**: October 27, 2025
