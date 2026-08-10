import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const port = parseInt(process.env.EMAIL_PORT || "587");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an OTP verification email from noreply@asif.to
 */
export const sendOtpEmail = async (to, fullName, otp) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";

  await transporter.sendMail({
    from,
    to,
    subject: `${otp} — Your asif.to Verification Code`,
    text: `Your asif.to verification code is: ${otp}. It expires in 10 minutes.`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>asif.to Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:24px;overflow:hidden;max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #27272a;background:#18181b;">
              <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">asif<span style="color:#2563eb;">.to</span></span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.25em;color:#2563eb;">Account Verification</p>
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Welcome to asif.to, ${fullName}</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#a1a1aa;line-height:1.6;">
                Use the 6-digit verification code below to verify your email address and activate your account. This code expires in 10 minutes.
              </p>

              <!-- OTP Block -->
              <div style="background:#09090b;border:1px solid #2563eb;border-radius:16px;text-align:center;padding:28px 20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.3em;color:#71717a;">Your 6-Digit OTP Code</p>
                <span style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:0.25em;font-family:monospace;">${otp}</span>
              </div>

              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                This email was sent automatically from <strong style="color:#a1a1aa;">noreply@asif.to</strong>. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #27272a;background:#09090b;">
              <p style="margin:0;font-size:11px;font-weight:600;color:#52525b;">
                © ${new Date().getFullYear()} asif.to. Modern Web Development Platform.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
};

/**
 * Send a welcome email after successful registration
 */
export const sendWelcomeEmail = async (to, fullName) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  await transporter.sendMail({
    from,
    to,
    subject: "Welcome to asif.to — Your Web Development Platform",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:24px;overflow:hidden;max-width:100%;">
          <tr><td style="padding:32px 40px;border-bottom:1px solid #27272a;">
            <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">asif<span style="color:#2563eb;">.to</span></span>
          </td></tr>
          <tr><td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#ffffff;">Welcome to asif.to, ${fullName}!</h1>
            <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;">
              Your account has been successfully verified and activated. You now have access to all courses, cheatsheets, flashcard revision decks, and practice quizzes.
            </p>
          </td></tr>
          <tr><td style="padding:20px 40px;border-top:1px solid #27272a;background:#09090b;">
            <p style="margin:0;font-size:11px;font-weight:600;color:#52525b;">
              © ${new Date().getFullYear()} asif.to. All rights reserved.
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
};

/**
 * Send a contact form notification to support
 */
export const sendContactEmail = async (name, email, subject, message) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  // Assuming the support email is support@asif.to, but fallback to admin or process.env if available
  const to = "support@asif.to"; 
  
  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:24px;overflow:hidden;max-width:100%;">
          <tr><td style="padding:32px 40px;border-bottom:1px solid #27272a;">
            <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">asif<span style="color:#2563eb;">.to</span></span>
            <span style="color:#a1a1aa; font-size: 14px; float: right; margin-top: 8px;">Contact Form Submission</span>
          </td></tr>
          <tr><td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border:0; border-top: 1px solid #27272a; margin-bottom: 24px;" />
            <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">Message:</h3>
            <p style="margin:0;font-size:14px;color:#d4d4d8;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
};
