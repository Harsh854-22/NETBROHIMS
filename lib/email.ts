export async function sendAppointmentEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    // Using Supabase Edge Function or external email service
    // For now, we'll use a simple fetch to your email API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ to, subject, html })
    })

    return response.ok
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export function generateAppointmentConfirmationEmail(
  patientName: string,
  doctorName: string,
  doctorSpecialization: string,
  date: string,
  time: string,
  reason?: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Product Sans', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #006989 0%, #008bb3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .appointment-details { background: #EAEBED; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; color: #006989; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #006989; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Appointment Confirmed</h1>
        </div>
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Doctor:</span>
              <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Specialization:</span>
              <span>${doctorSpecialization}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${time}</span>
            </div>
            ${reason ? `
            <div class="detail-row">
              <span class="detail-label">Reason:</span>
              <span>${reason}</span>
            </div>
            ` : ''}
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring any relevant medical records or test results</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br><strong>Hospital Management System</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Hospital Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateAppointmentReminderEmail(
  patientName: string,
  doctorName: string,
  doctorSpecialization: string,
  date: string,
  time: string,
  reason?: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Product Sans', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #006989 0%, #008bb3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .reminder-box { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .appointment-details { background: #EAEBED; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; color: #006989; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${patientName},</p>
          
          <div class="reminder-box">
            <strong>⚠️ Friendly Reminder:</strong> You have an upcoming appointment!
          </div>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Doctor:</span>
              <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Specialization:</span>
              <span>${doctorSpecialization}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${time}</span>
            </div>
            ${reason ? `
            <div class="detail-row">
              <span class="detail-label">Reason:</span>
              <span>${reason}</span>
            </div>
            ` : ''}
          </div>
          
          <p><strong>Please Remember:</strong></p>
          <ul>
            <li>Arrive 15 minutes early for check-in</li>
            <li>Bring your ID and insurance card</li>
            <li>Bring any relevant medical records</li>
          </ul>
          
          <p>Looking forward to seeing you!</p>
          
          <p>Best regards,<br><strong>Hospital Management System</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Hospital Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateRescheduleEmail(
  patientName: string,
  doctorName: string,
  doctorSpecialization: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string,
  reason?: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Product Sans', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #006989 0%, #008bb3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .reschedule-box { background: #E3F2FD; border-left: 4px solid #2196F3; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .appointment-details { background: #EAEBED; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; color: #006989; }
        .old-value { text-decoration: line-through; color: #999; }
        .new-value { color: #2196F3; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Appointment Rescheduled</h1>
        </div>
        <div class="content">
          <p>Dear ${patientName},</p>
          
          <div class="reschedule-box">
            <strong>ℹ️ Notice:</strong> Your appointment has been rescheduled.
          </div>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Doctor:</span>
              <span>Dr. ${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Specialization:</span>
              <span>${doctorSpecialization}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Previous Date:</span>
              <span class="old-value">${new Date(oldDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">New Date:</span>
              <span class="new-value">${new Date(newDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Previous Time:</span>
              <span class="old-value">${oldTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">New Time:</span>
              <span class="new-value">${newTime}</span>
            </div>
            ${reason ? `
            <div class="detail-row">
              <span class="detail-label">Reason:</span>
              <span>${reason}</span>
            </div>
            ` : ''}
          </div>
          
          <p>If you have any concerns about this change, please contact us immediately.</p>
          
          <p>Best regards,<br><strong>Hospital Management System</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Hospital Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `
}
