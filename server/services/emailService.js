const nodemailer = require('nodemailer');

/**
 * Campus Buddy Email Delivery Service
 * Supports Gmail SMTP (App Password), custom SMTP, and Resend
 */

function getTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    // If Gmail is configured
    if (user.includes('@gmail.com') || process.env.SMTP_SERVICE === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }

    // Generic SMTP host
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT == '465',
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Send password reset verification code email
 */
async function sendVerificationCode({ to, code, name }) {
  const transporter = getTransporter();

  const recipientName = name || 'Student';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6FB; margin: 0; padding: 24px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
          .header { text-align: center; margin-bottom: 28px; }
          .logo-badge { display: inline-block; background: #1944F1; color: #ffffff; font-weight: 800; font-size: 20px; padding: 10px 20px; border-radius: 16px; letter-spacing: -0.5px; }
          .title { font-size: 22px; font-weight: 700; color: #0F172A; margin: 20px 0 8px; }
          .subtitle { font-size: 14px; color: #64748B; margin: 0; line-height: 1.5; }
          .code-box { background: #F1F4FD; border: 2px dashed #1944F1; border-radius: 18px; padding: 20px; text-align: center; margin: 28px 0; }
          .code-text { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1944F1; font-family: 'Courier New', Courier, monospace; }
          .expires-text { font-size: 12px; color: #94A3B8; margin-top: 8px; font-weight: 500; }
          .footer { font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.6; margin-top: 32px; border-top: 1px solid #F1F5F9; pt-4; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-badge">Campus Buddy</div>
            <h1 class="title">Password Reset Code</h1>
            <p class="subtitle">Hi ${recipientName}, we received a request to reset your password. Use the verification code below to proceed.</p>
          </div>
          <div class="code-box">
            <div class="code-text">${code}</div>
            <div class="expires-text">Valid for 15 minutes</div>
          </div>
          <p style="font-size: 13px; color: #64748B; line-height: 1.6; text-align: center;">
            If you did not request a password reset, please ignore this email or reach out to support if you have concerns.
          </p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Campus Buddy Marketplace. Verified Student Community.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@campusbuddy.app';
    const info = await transporter.sendMail({
      from: `"Campus Buddy" <${fromAddress}>`,
      to,
      subject: `${code} is your Campus Buddy verification code`,
      text: `Your Campus Buddy password reset code is: ${code}. This code is valid for 15 minutes.`,
      html: htmlContent
    });
    console.log(`[EmailService] Verification email delivered to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  }

  // Fallback: If RESEND_API_KEY is available
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Campus Buddy <onboarding@resend.dev>',
        to: [to],
        subject: `${code} is your Campus Buddy verification code`,
        html: htmlContent
      })
    });
    const resData = await res.json();
    if (res.ok) {
      console.log(`[EmailService] Verification email delivered via Resend to ${to} (ID: ${resData.id})`);
      return { success: true, messageId: resData.id };
    }
    console.warn('[EmailService] Resend API error:', resData);
    throw new Error(resData.message || 'Email delivery failed via Resend');
  }

  // If no email credentials configured in environment
  console.warn('[EmailService] Neither EMAIL_USER/EMAIL_PASS nor RESEND_API_KEY is configured in environment.');
  throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASS (Gmail App Password) in your server environment.');
}

module.exports = {
  sendVerificationCode
};
