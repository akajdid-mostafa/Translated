import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendNotificationEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}

export const sendRequestConfirmation = async (customerEmail: string, requestId: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Translation Request Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
            ✓ Request Confirmed
          </h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
            Your translation request has been successfully submitted
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              Request ID
            </h3>
            <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
              <span style="color: #2563eb; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; word-break: break-all;">${requestId}</span>
            </div>
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              Keep this ID for your records and future reference
            </p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              What happens next?
            </h3>
            <div style="margin: 15px 0;">
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">1</span>
                </div>
                <p style="margin: 0; color: #475569; font-size: 15px;">Our team will review your document and requirements</p>
              </div>
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">2</span>
                </div>
                <p style="margin: 0; color: #475569; font-size: 15px;">We'll send you a detailed quote within 24 hours</p>
              </div>
              <div style="display: flex; align-items: center; margin: 12px 0;">
                <div style="width: 24px; height: 24px; background-color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">3</span>
                </div>
                <p style="margin: 0; color: #475569; font-size: 15px;">Once approved, we'll begin the translation process</p>
              </div>
            </div>
          </div>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              📞 Need immediate assistance?
            </h4>
            <p style="color: #075985; margin: 0; font-size: 14px;">
              Contact us at <a href="mailto:support@translated.ae" style="color: #2563eb; text-decoration: none;">support@translated.ae</a> or call us for urgent requests.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0 20px 0;">
            <p style="color: #64748b; font-size: 16px; margin: 0;">
              Thank you for choosing <strong style="color: #2563eb;">Translated.ae</strong>
            </p>
            <p style="color: #94a3b8; font-size: 14px; margin: 10px 0 0 0;">
              Professional translation services you can trust
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
            This is an automated message. Please do not reply to this email.<br>
            © 2024 Translated.ae. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendNotificationEmail(customerEmail, "✓ Translation Request Confirmed - Translated.ae", html)
}

export const sendAdminNotification = async (
  adminEmail: string, 
  requestData: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    sourceLanguage: string;
    targetLanguage: string;
    documentType: string;
    urgency: string;
    numberOfPages: string;
    estimatedPrice?: number;
    originalFileName: string;
    requestId: string;
  }
) => {
  const urgencyColor = requestData.urgency === 'URGENT' ? '#dc2626' : requestData.urgency === 'EXPRESS' ? '#ea580c' : '#059669'
  const urgencyIcon = requestData.urgency === 'URGENT' ? '🚨' : requestData.urgency === 'EXPRESS' ? '⚡' : '📋'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Translation Request - Admin Alert</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
            ${urgencyIcon} New Translation Request
          </h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">
            Action required - Customer request pending review
          </p>
        </div>

        <!-- Urgency Alert -->
        <div style="background-color: ${urgencyColor === '#dc2626' ? '#fef2f2' : urgencyColor === '#ea580c' ? '#fff7ed' : '#f0fdf4'}; border-left: 4px solid ${urgencyColor}; padding: 15px 30px; margin: 0;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 10px;">${urgencyIcon}</span>
            <div>
              <h3 style="color: ${urgencyColor}; margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase;">
                ${requestData.urgency} Priority Request
              </h3>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
                Request ID: <span style="font-family: 'Courier New', monospace; font-weight: bold;">${requestData.requestId}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          
          <!-- Customer Information -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              👤 Customer Information
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Name:</p>
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${requestData.customerName}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Email:</p>
                <p style="margin: 0; color: #2563eb; font-size: 16px;">
                  <a href="mailto:${requestData.customerEmail}" style="color: #2563eb; text-decoration: none;">${requestData.customerEmail}</a>
                </p>
              </div>
              ${requestData.customerPhone ? `
              <div>
                <p style="margin: 8px 0; color: #64748b; font-size: 14px; font-weight: 500;">Phone:</p>
                <p style="margin: 0; color: #1e293b; font-size: 16px;">
                  <a href="tel:${requestData.customerPhone}" style="color: #2563eb; text-decoration: none;">${requestData.customerPhone}</a>
                </p>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Translation Details -->
          <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              📄 Translation Details
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0; color: #075985; font-size: 14px; font-weight: 500;">Source Language:</p>
                <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">${requestData.sourceLanguage}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #075985; font-size: 14px; font-weight: 500;">Target Language:</p>
                <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">${requestData.targetLanguage}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #075985; font-size: 14px; font-weight: 500;">Document Type:</p>
                <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">${requestData.documentType}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #075985; font-size: 14px; font-weight: 500;">Pages:</p>
                <p style="margin: 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">${requestData.numberOfPages}</p>
              </div>
            </div>
            ${requestData.estimatedPrice ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #0ea5e9;">
              <p style="margin: 8px 0; color: #075985; font-size: 14px; font-weight: 500;">Estimated Price:</p>
              <p style="margin: 0; color: #0c4a6e; font-size: 20px; font-weight: 700;">${requestData.estimatedPrice} DH</p>
            </div>
            ` : ''}
          </div>

          <!-- File Information -->
          <div style="background-color: #fefce8; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #eab308;">
            <h3 style="color: #a16207; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              📎 File Information
            </h3>
            <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #eab308;">
              <p style="margin: 0; color: #a16207; font-size: 16px; font-weight: 600; word-break: break-all;">
                ${requestData.originalFileName}
              </p>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              ⚠️ Action Required
            </h3>
            <p style="color: #991b1b; margin: 0 0 20px 0; font-size: 16px;">
              Please log in to the admin dashboard to review and process this request.
            </p>
            <div style="background-color: #dc2626; border-radius: 8px; padding: 12px 24px; display: inline-block;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/dashboard" 
                 style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                🔗 Go to Admin Dashboard
              </a>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0 20px 0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br><strong style="color: #2563eb;">Translated.ae Admin System</strong>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
            This is an automated notification. Please do not reply to this email.<br>
            © 2024 Translated.ae. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendNotificationEmail(adminEmail, `${urgencyIcon} New Translation Request - ${requestData.urgency} Priority`, html)
}
