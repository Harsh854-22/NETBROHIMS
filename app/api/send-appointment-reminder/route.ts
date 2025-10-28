import { NextResponse } from 'next/server'
import { generateAppointmentReminderEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patientEmail, 
      patientName, 
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

    if (!resendApiKey) {
      console.log('Email content generated (API key not configured):')
      console.log('To:', patientEmail)
      console.log('Subject: Appointment Reminder')
      return NextResponse.json({ 
        success: true, 
        message: 'Email API not configured. Check console for email preview.' 
      })
    }

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
      return NextResponse.json({ success: true, message: 'Reminder sent successfully' })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
