import { NextResponse } from 'next/server'
import { generateRescheduleEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patientEmail, 
      patientName, 
      doctorName, 
      doctorSpecialization,
      oldDate,
      oldTime,
      newDate,
      newTime,
      reason
    } = body

    // Generate email HTML
    const emailHtml = generateRescheduleEmail(
      patientName,
      doctorName,
      doctorSpecialization,
      oldDate,
      oldTime,
      newDate,
      newTime,
      reason
    )

    // Send email using Resend API
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.log('Email content generated (API key not configured):')
      console.log('To:', patientEmail)
      console.log('Subject: Appointment Rescheduled')
      return NextResponse.json({ 
        success: true, 
        message: 'Email API not configured. Appointment rescheduled successfully.' 
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
        subject: '📅 Appointment Rescheduled - Hospital Management System',
        html: emailHtml
      })
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending reschedule email:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
