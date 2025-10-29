import { NextResponse } from 'next/server'
import { generateAppointmentReminderEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patientEmail, 
      patientName, 
        patientPhone,
        doctorPhone,
        doctorName, 
      doctorSpecialization,
      appointmentDate,
      appointmentTime,
      reason
    } = body

    // Generate email HTML
    const emailHtml = generateAppointmentReminderEmail(
      patientName,
      doctorName,
      doctorSpecialization,
      appointmentDate,
      appointmentTime,
      reason
    )

    // Send email using Resend API (you'll need to set this up)
    const resendApiKey = process.env.RESEND_API_KEY
    let emailResult = { success: false, message: 'Email not attempted' }

    if (!resendApiKey) {
      console.log('Email content generated (API key not configured):')
      console.log('To:', patientEmail)
      console.log('Subject: Appointment Reminder')
      emailResult = { success: true, message: 'Email API not configured. Check console for email preview.' }
    } else {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Hospital Management <onboarding@resend.dev>',
          to: patientEmail,
          subject: '⏰ Appointment Reminder - Hospital Management System',
          html: emailHtml
        })
      })

      if (response.ok) {
        emailResult = { success: true, message: 'Email sent successfully' }
      } else {
        emailResult = { success: false, message: 'Failed to send email' }
      }
    }

    // Send SMS using Fast2SMS (if configured)
    const fast2smsKey = process.env.FAST2SMS_API_KEY
    let smsResult = { success: false, message: 'SMS not attempted' }

    const sendSms = async (to: string | undefined, message: string) => {
      if (!to) return { ok: false, status: 'missing-number' }
      try {
        const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': fast2smsKey || ''
          },
          body: JSON.stringify({
            route: 'v3',
            message: message,
            language: 'english',
            flash: 0,
            numbers: to
          })
        })
        const data = await resp.json().catch(() => ({}))
        return { ok: resp.ok, status: resp.status, body: data }
      } catch (err) {
        console.error('Fast2SMS error:', err)
        return { ok: false, status: 'error' }
      }
    }

    if (!fast2smsKey) {
      console.log('Fast2SMS key not configured. SMS preview:')
      console.log('Patient number:', patientPhone)
      console.log('Doctor number:', doctorPhone)
      console.log('Patient message:', `Reminder: Hi ${patientName}, you have an appointment with Dr. ${doctorName} (${doctorSpecialization}) on ${appointmentDate} at ${appointmentTime}. Reason: ${reason || 'N/A'}.`)
      smsResult = { success: true, message: 'SMS API key not configured. Check server logs for preview.' }
    } else {
      // send patient SMS
      const patientMsg = `Reminder: Hi ${patientName}, you have an appointment with Dr. ${doctorName} (${doctorSpecialization}) on ${appointmentDate} at ${appointmentTime}. Reason: ${reason || 'N/A'}.`;
      const doctorMsg = `Reminder: Hi Dr. ${doctorName}, you have an appointment with ${patientName} on ${appointmentDate} at ${appointmentTime}. Reason: ${reason || 'N/A'}.`;

      const patientResp = await sendSms(patientPhone, patientMsg)
      const doctorResp = await sendSms(doctorPhone, doctorMsg)

      smsResult = {
        success: !!(patientResp.ok || doctorResp.ok),
        message: `patient: ${patientResp.ok ? 'sent' : JSON.stringify(patientResp)}, doctor: ${doctorResp.ok ? 'sent' : JSON.stringify(doctorResp)}`
      }
    }

    return NextResponse.json({ success: true, email: emailResult, sms: smsResult })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
