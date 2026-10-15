const nodemailer = require('nodemailer');

/**
 * Campus Buddy Email Delivery Service
 * Supports Gmail SMTP (App Password), custom SMTP, and Resend
 */

function getTransporter() {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
  // Strip all whitespace from App Password (e.g. Google presents "xxxx xxxx xxxx xxxx")
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    // If Gmail is configured
    if (user.toLowerCase().includes('@gmail.com') || process.env.SMTP_SERVICE === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
    }

    // Generic SMTP host
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT == '465',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }

  return null;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send password reset verification code email
 */
async function sendVerificationCode({ to, code, name }) {
  const transporter = getTransporter();

  const recipientName = escapeHtml(name || 'Student');
  const safeCode = escapeHtml(code);
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
            <div class="code-text">${safeCode}</div>
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

  // 1. Primary Cloud Strategy: If RESEND_API_KEY is available, use HTTPS (Port 443)
  // This completely avoids cloud firewall port-blocking (e.g. Render Free Tier blocks SMTP ports 465/587)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
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
        console.log(`[EmailService] Verification email successfully delivered via Resend to ${to} (ID: ${resData.id})`);
        return { success: true, delivered: true, messageId: resData.id, provider: 'resend' };
      }
      console.warn('[EmailService] Resend API error:', resData);
    } catch (resendErr) {
      console.warn('[EmailService] Resend HTTPS delivery error:', resendErr.message);
    }
  }

  // 2. Secondary Strategy: Direct SMTP Transporter (Localhost or unblocked hosts)
  if (transporter) {
    const senderUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const fromAddress = process.env.EMAIL_FROM || `"Campus Buddy" <${senderUser}>`;

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${code} is your Campus Buddy verification code`,
        text: `Your Campus Buddy password reset code is: ${code}. This code is valid for 15 minutes.`,
        html: htmlContent
      });
      console.log(`[EmailService] Verification email delivered via SMTP to ${to} (Message ID: ${info.messageId})`);
      return { success: true, delivered: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error('[EmailService] SMTP delivery error:', err.message);
      if (err.code === 'EAUTH' || (err.response && err.response.includes('535'))) {
        throw new Error('Gmail authentication failed. Please check your EMAIL_USER and EMAIL_PASS (use a 16-character Google App Password).');
      }
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  }

  // If no email credentials configured in environment
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('================================================================');
  console.log('⚠️  [EmailService] Neither EMAIL_USER nor RESEND_API_KEY is configured in .env');
  console.log(`🔑 PASSWORD RESET OTP for ${to}: [ ${code} ]`);
  console.log('👉 Valid for 15 minutes.');
  console.log('👉 To enable real email delivery, add EMAIL_USER and EMAIL_PASS to server/.env');
  console.log('================================================================');

  if (!isProduction) {
    return {
      success: true,
      delivered: false,
      isDevMode: true
    };
  }

  throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASS (Gmail App Password) in your server environment.');
}

module.exports = {
  sendVerificationCode
};
