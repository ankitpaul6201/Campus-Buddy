const nodemailer = require('nodemailer');

/**
 * Campus Buddy Email Delivery Service
 * Dedicated Gmail SMTP using ankitpaul9341@gmail.com and Google App Password
 * Supports both Port 587 (STARTTLS - allowed on free cloud hosts like Koyeb) and Port 465 (SSL)
 */

function createGmailTransporter(port = 587) {
  const user = (process.env.EMAIL_USER || 'ankitpaul9341@gmail.com').trim();
  const rawPass = (process.env.EMAIL_PASS || 'slmjcgobjlphuevg').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (port === 587) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL/TLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });
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
 * Send password reset verification code email from ankitpaul9341@gmail.com
 */
async function sendVerificationCode({ to, code, name }) {
  const senderUser = (process.env.EMAIL_USER || 'ankitpaul9341@gmail.com').trim();
  const fromAddress = `"Campus Buddy" <${senderUser}>`;

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

  // Try Port 587 (STARTTLS) first, fall back to Port 465 (SSL)
  const portsToTry = [587, 465];
  let lastError = null;

  for (const port of portsToTry) {
    try {
      const transporter = createGmailTransporter(port);
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${code} is your Campus Buddy verification code`,
        text: `Your Campus Buddy password reset code is: ${code}. This code is valid for 15 minutes.`,
        html: htmlContent
      });

      console.log(`[EmailService] Verification email successfully delivered via Gmail (Port ${port}) from ${senderUser} to ${to} (Message ID: ${info.messageId})`);
      return { success: true, delivered: true, messageId: info.messageId, port, provider: 'gmail' };
    } catch (err) {
      console.warn(`[EmailService] Gmail delivery attempt on port ${port} failed:`, err.message);
      lastError = err;
    }
  }

  console.error(`[EmailService] All Gmail delivery attempts failed for ${to}:`, lastError?.message);
  if (lastError?.code === 'EAUTH' || (lastError?.response && lastError.response.includes('535'))) {
    throw new Error('Gmail authentication failed. Please check your EMAIL_USER and EMAIL_PASS (use a 16-character Google App Password).');
  }
  throw new Error(`Email delivery failed: ${lastError?.message || 'SMTP connection timeout'}`);
}

module.exports = {
  sendVerificationCode
};
