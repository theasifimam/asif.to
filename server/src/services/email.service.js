import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an OTP verification email
 */
export const sendOtpEmail = async (to, fullName, otp) => {
  const from = process.env.EMAIL_FROM || "asif <noreply@asif.to>";

  await transporter.sendMail({
    from,
    to,
    subject: `${otp} — Your asif Verification Code`,
    text: `Your asif verification code is: ${otp}. It expires in 10 minutes.`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>asif Verification</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:24px;overflow:hidden;max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 32px;border-bottom:1px solid #27272a;">
              <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;font-style:italic;">asif.</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#71717a;">Signal Verification</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">Hello, ${fullName}.</h1>
              <p style="margin:0 0 32px;font-size:14px;color:#a1a1aa;line-height:1.7;">
                Use the verification code below to complete your authentication. It expires in 10 minutes.
              </p>

              <!-- OTP Block -->
              <div style="background:#09090b;border:1px solid #27272a;border-radius:16px;text-align:center;padding:32px 24px;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4em;color:#52525b;">Verification Code</p>
                <span style="font-size:48px;font-weight:900;color:#ffffff;letter-spacing:0.2em;font-family:monospace;">${otp}</span>
              </div>

              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#3f3f46;">
                © 2026 asif Editorial Collective // Authorized Personnel Only
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
  const from = process.env.EMAIL_FROM || "asif <noreply@asif.to>";
  await transporter.sendMail({
    from,
    to,
    subject: "Welcome to the asif Protocol",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:24px;overflow:hidden;max-width:100%;">
          <tr><td style="padding:40px 48px 32px;border-bottom:1px solid #27272a;">
            <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;font-style:italic;">asif.</span>
          </td></tr>
          <tr><td style="padding:40px 48px;">
            <h1 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#ffffff;">Welcome, ${fullName}.</h1>
            <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;">
              You have successfully joined the asif network. Your editorial identity has been provisioned and you now have access to independent journalism at its finest.
            </p>
          </td></tr>
          <tr><td style="padding:24px 48px;border-top:1px solid #27272a;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#3f3f46;">
              © 2026 asif Editorial Collective
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
