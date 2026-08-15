import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: false });

const BRAND = {
  ink: "#1a1c18",
  muted: "#666960",
  primary: "#5d6b33",
  primaryDark: "#46521f",
  primaryContainer: "#dfeba8",
  primaryContainerInk: "#191e00",
  background: "#f1f2ee",
  surface: "#ffffff",
  surfaceLow: "#f9faf7",
  border: "#e2e3dd",
};

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = Number.parseInt(process.env.EMAIL_PORT || "587", 10);

  if (!host || !user || !pass) {
    throw new Error(
      "Email delivery is not configured. EMAIL_HOST, EMAIL_USER and EMAIL_PASSWORD are required.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const ampersand = String.fromCharCode(38);
    const entities = {
      "&": `${ampersand}amp;`,
      "<": `${ampersand}lt;`,
      ">": `${ampersand}gt;`,
      '"': `${ampersand}quot;`,
      "'": `${ampersand}#039;`,
    };

    return entities[character];
  });

const getSiteUrl = () => {
  const configuredUrl =
    process.env.WEB_URL ||
    (process.env.NODE_ENV === "production"
      ? process.env.PROD_CLIENT_URL
      : process.env.DEV_CLIENT_URL);

  return (configuredUrl || "https://asif.to").replace(/\/$/, "");
};

const renderButton = (label, href) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
    <tr>
      <td bgcolor="${BRAND.primary}" style="border-radius:12px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 22px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:800;line-height:20px;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(label)} &nbsp;&rarr;</a>
      </td>
    </tr>
  </table>`;

const renderNotice = (content) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:14px;">
    <tr>
      <td style="padding:16px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:13px;line-height:20px;color:${BRAND.muted};">${content}</td>
    </tr>
  </table>`;

const renderEmailLayout = ({
  preheader,
  eyebrow,
  title,
  intro,
  content,
}) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .page-pad { padding: 20px 12px !important; }
      .email-card { border-radius: 18px !important; }
      .header-cell { padding: 22px 22px 18px !important; }
      .content-cell { padding: 30px 22px 26px !important; }
      .footer-cell { padding: 20px 22px 24px !important; }
      .email-title { font-size: 28px !important; line-height: 34px !important; }
      .otp-code { font-size: 35px !important; letter-spacing: 7px !important; }
      .stack-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .stack-gap { padding-top: 10px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.background};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${BRAND.background};">
    <tr>
      <td align="center" class="page-pad" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-card" style="width:100%;max-width:600px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(26,28,24,0.07);">
          <tr>
            <td class="header-cell" style="padding:24px 36px 20px;border-bottom:1px solid ${BRAND.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" style="width:38px;height:38px;background:${BRAND.primaryContainer};border-radius:11px;font-family:Outfit,'Segoe UI',Arial,sans-serif;font-size:19px;font-weight:900;color:${BRAND.primaryContainerInk};">a.</td>
                        <td style="padding-left:11px;font-family:Outfit,'Segoe UI',Arial,sans-serif;font-size:20px;font-weight:900;color:${BRAND.ink};">asif.to</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:800;line-height:16px;color:${BRAND.primary};text-transform:uppercase;">Developer learning</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:40px 36px 34px;">
              <p style="margin:0 0 12px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:800;line-height:16px;color:${BRAND.primary};text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
              <h1 class="email-title" style="margin:0 0 16px;font-family:Outfit,'Segoe UI',Arial,sans-serif;font-size:34px;font-weight:900;line-height:40px;color:${BRAND.ink};">${escapeHtml(title)}</h1>
              <p style="margin:0 0 28px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:24px;color:${BRAND.muted};">${intro}</p>
              ${content}
            </td>
          </tr>
          <tr>
            <td class="footer-cell" style="padding:22px 36px 28px;background:${BRAND.surfaceLow};border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 6px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;line-height:18px;color:${BRAND.ink};">Learn. Build. Revise.</p>
              <p style="margin:0;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;line-height:18px;color:#85887f;">&copy; ${new Date().getFullYear()} asif.to &nbsp;&bull;&nbsp; <a href="mailto:support@asif.to" style="color:${BRAND.primary};text-decoration:none;">support@asif.to</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Send an OTP verification email from noreply@asif.to.
 */
export const sendOtpEmail = async (to, fullName, otp) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const safeName = escapeHtml(fullName || "there");
  const safeOtp = escapeHtml(otp);

  await getTransporter().sendMail({
    from,
    to,
    subject: `${otp} - Your asif.to verification code`,
    text: `Hi ${fullName || "there"},\n\nYour asif.to verification code is ${otp}. It expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email.\n\nasif.to`,
    html: renderEmailLayout({
      preheader: `${otp} is your asif.to verification code. It expires in 10 minutes.`,
      eyebrow: "Account verification",
      title: `Confirm your email, ${fullName || "there"}`,
      intro: `Hi ${safeName}, use the secure code below to finish setting up your account. It is valid for the next 10 minutes.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${BRAND.primaryContainer};border-radius:16px;">
          <tr>
            <td align="center" style="padding:25px 18px 26px;">
              <p style="margin:0 0 8px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:10px;font-weight:800;line-height:16px;color:${BRAND.primaryDark};text-transform:uppercase;">Your one-time code</p>
              <div class="otp-code" style="font-family:'Courier New',monospace;font-size:42px;font-weight:700;line-height:48px;letter-spacing:10px;color:${BRAND.primaryContainerInk};white-space:nowrap;">${safeOtp}</div>
            </td>
          </tr>
        </table>
        ${renderNotice(`For your security, never share this code. asif.to support will never ask you for it. If you did not request this email, you can safely ignore it.`)}
        <p style="margin:0;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:12px;line-height:19px;color:#85887f;">Sent automatically by <strong style="color:${BRAND.muted};">noreply@asif.to</strong>. Please do not reply to this message.</p>`,
    }),
  });
};

/**
 * Send a welcome email after successful registration.
 */
export const sendWelcomeEmail = async (to, fullName) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const siteUrl = getSiteUrl();
  const safeName = escapeHtml(fullName || "there");

  await getTransporter().sendMail({
    from,
    to,
    subject: "Welcome to asif.to - Your account is ready",
    text: `Welcome to asif.to, ${fullName || "there"}!\n\nYour account is verified and ready. Explore courses, cheatsheets, flashcards, and practice quizzes at ${siteUrl}.\n\nasif.to`,
    html: renderEmailLayout({
      preheader: "Your asif.to account is verified and ready for learning.",
      eyebrow: "Account ready",
      title: `Welcome aboard, ${fullName || "there"}`,
      intro: `Hi ${safeName}, your account has been verified. Your learning workspace is ready whenever you are.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
          <tr>
            <td class="stack-cell" width="50%" valign="top" style="padding-right:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:14px;">
                <tr><td style="padding:17px;"><p style="margin:0 0 5px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:13px;font-weight:800;color:${BRAND.ink};">Learn step by step</p><p style="margin:0;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Follow focused courses and practical tutorials.</p></td></tr>
              </table>
            </td>
            <td class="stack-cell stack-gap" width="50%" valign="top" style="padding-left:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:14px;">
                <tr><td style="padding:17px;"><p style="margin:0 0 5px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:13px;font-weight:800;color:${BRAND.ink};">Practice and revise</p><p style="margin:0;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Use quizzes, flashcards, and cheatsheets.</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
        ${renderButton("Start learning", siteUrl)}
        <p style="margin:0;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:13px;line-height:21px;color:${BRAND.muted};">Need help? Reply to us at <a href="mailto:support@asif.to" style="font-weight:700;color:${BRAND.primary};text-decoration:none;">support@asif.to</a>.</p>`,
    }),
  });
};

export const sendUserInvitationEmail = async (to, role, inviteUrl) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  await getTransporter().sendMail({
    from,
    to,
    subject: `You're invited to join asif.to as ${role}`,
    text: `You have been invited to join asif.to as ${role}. Accept your invitation within 7 days: ${inviteUrl}`,
    html: renderEmailLayout({
      preheader: `Join the asif.to editorial workspace as ${role}.`,
      eyebrow: "Team invitation",
      title: "You’re invited to asif.to",
      intro: `You have been invited to join the asif.to workspace as <strong>${escapeHtml(role)}</strong>. This secure invitation expires in seven days.`,
      content: `${renderButton("Accept invitation", inviteUrl)}${renderNotice("Sign in with the same email address that received this invitation. If you were not expecting it, you can safely ignore this email.")}`,
    }),
  });
};

/**
 * Send a contact form notification to support.
 */
export const sendContactEmail = async (name, email, subject, message) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const to = process.env.ADMIN_NOTIFY_EMAIL || "support@asif.to";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

  await getTransporter().sendMail({
    from,
    to,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: renderEmailLayout({
      preheader: `${name} sent a new message through the asif.to contact form.`,
      eyebrow: "Contact form",
      title: "A new message arrived",
      intro: `A visitor submitted the contact form on asif.to. Replying to this email will respond directly to ${safeName}.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:14px;">
          <tr><td width="92" valign="top" style="padding:18px 8px 8px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:800;color:#85887f;text-transform:uppercase;">From</td><td style="padding:18px 18px 8px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:${BRAND.ink};">${safeName}</td></tr>
          <tr><td width="92" valign="top" style="padding:8px 8px 8px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:800;color:#85887f;text-transform:uppercase;">Email</td><td style="padding:8px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:14px;color:${BRAND.ink};word-break:break-word;"><a href="mailto:${safeEmail}" style="font-weight:700;color:${BRAND.primary};text-decoration:none;">${safeEmail}</a></td></tr>
          <tr><td width="92" valign="top" style="padding:8px 8px 18px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:800;color:#85887f;text-transform:uppercase;">Subject</td><td style="padding:8px 18px 18px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:14px;color:${BRAND.ink};">${safeSubject}</td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;border-left:4px solid ${BRAND.primary};background:${BRAND.surfaceLow};">
          <tr><td style="padding:20px 20px 20px 22px;font-family:Inter,'Segoe UI',Arial,sans-serif;font-size:14px;line-height:23px;color:${BRAND.ink};word-break:break-word;">${safeMessage}</td></tr>
        </table>
        ${renderButton(`Reply to ${name || "sender"}`, `mailto:${email}`)}`,
    }),
  });
};
