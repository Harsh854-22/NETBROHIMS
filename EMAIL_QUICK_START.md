# ✅ Email Setup Quick Checklist

## Choose Your Path:

### 🚀 **Path 1: Resend (Recommended for Beginners)**

- [ ] Go to https://resend.com/ and create free account
- [ ] Click "API Keys" → "Create API Key"
- [ ] Copy the API key (starts with `re_`)
- [ ] Open `.env.local` file in your project
- [ ] Add this line: `RESEND_API_KEY=re_YourAPIKeyHere`
- [ ] Save the file
- [ ] Restart dev server: Stop the current server (Ctrl+C) and run `npm run dev` again
- [ ] Test: Login as Admin → Appointments → Click "Remind" button
- [ ] Check patient's email inbox (check spam folder too!)

**That's it! You're done! 🎉**

---

### 📧 **Path 2: Gmail SMTP (Alternative)**

- [ ] Enable 2FA on your Gmail account
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Create app password for "Mail"
- [ ] Copy the 16-character password
- [ ] Run: `npm install nodemailer`
- [ ] Add to `.env.local`:
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your.email@gmail.com
  EMAIL_PASS=your-16-char-password
  ```
- [ ] Tell me you're done so I can modify the API code!

---

## 🎯 What You Get:

✅ **Admin Panel:**
- Delete button for appointments
- Manual "Remind" button to send email to patient
- Delete buttons for doctors and patients

✅ **Email Templates:**
- Appointment Confirmation (professional HTML)
- Appointment Reminder (professional HTML)
- Reschedule Notification (professional HTML)

✅ **Features:**
- Beautiful emails with your brand colors (#006989)
- Responsive design (looks good on mobile)
- Professional formatting

---

## 🧪 Testing Steps:

1. **Open your app:** http://localhost:3001
2. **Login as admin**
3. **Go to Appointments tab**
4. **Click the blue "Remind" button** on any appointment
5. **Check the patient's email**

---

## ❓ Having Issues?

**Email not sending?**
→ Make sure you restarted the dev server after adding the API key

**Can't find .env.local?**
→ It's in the root folder of your project (same level as package.json)

**Emails going to spam?**
→ Mark as "Not Spam" once, next emails will go to inbox

**Want automatic reminders?**
→ Ask me! I can set up a system to send reminders 24 hours before appointments

---

## 🎉 Next Steps After Setup:

1. Test all email types
2. Customize email templates (add logo, change colors)
3. Set up automatic reminders (optional)
4. Add SMS notifications (optional)
5. Deploy to production

---

**Ready to start? Pick Path 1 (Resend) - it's the easiest! 🚀**
