import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: false });

const BRAND = {
  ink: "#09090b",
  heading: "#18181b",
  body: "#3f3f46",
  muted: "#71717a",
  subtle: "#a1a1aa",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  primaryContainer: "#eff6ff",
  primaryContainerBorder: "#bfdbfe",
  primaryContainerInk: "#1e40af",
  background: "#f4f4f5",
  surface: "#ffffff",
  surfaceLow: "#f8fafc",
  border: "#e4e4e7",
  borderLight: "#f4f4f5",
  danger: "#dc2626",
  dangerContainer: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerInk: "#991b1b",
};

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = Number.parseInt(process.env.EMAIL_PORT || "587", 10);
  const secure =
    process.env.EMAIL_SECURE !== undefined
      ? process.env.EMAIL_SECURE === "true"
      : port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      "Email delivery is not configured. EMAIL_HOST, EMAIL_USER and EMAIL_PASSWORD are required.",
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== "false",
      minVersion: "TLSv1.2",
    },
  });

  return cachedTransporter;
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
      <td bgcolor="${BRAND.primary}" style="border-radius:9999px;box-shadow:0 4px 14px rgba(37,99,235,0.3);">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:'Outfit','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;line-height:18px;color:#ffffff;text-decoration:none;border-radius:9999px;">${escapeHtml(label)} &nbsp;&rarr;</a>
      </td>
    </tr>
  </table>`;

const renderNotice = (content) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:16px;">
    <tr>
      <td style="padding:16px 18px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:20px;color:${BRAND.muted};">${content}</td>
    </tr>
  </table>`;

const renderEmailLayout = ({
  preheader,
  eyebrow,
  title,
  intro,
  content,
  badgeText = "Tutorials",
}) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 620px) {
      .page-pad { padding: 20px 12px !important; }
      .email-card { border-radius: 20px !important; }
      .header-cell { padding: 20px 22px 18px !important; }
      .content-cell { padding: 28px 22px 24px !important; }
      .footer-cell { padding: 20px 22px 24px !important; }
      .email-title { font-size: 26px !important; line-height: 32px !important; }
      .otp-code { font-size: 34px !important; letter-spacing: 6px !important; }
      .stack-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .stack-gap { padding-top: 12px !important; padding-left: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.background};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${BRAND.background};">
    <tr>
      <td align="center" class="page-pad" style="padding:40px 16px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" class="email-card" style="width:100%;max-width:580px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:28px;overflow:hidden;box-shadow:0 20px 45px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td class="header-cell" style="padding:24px 34px 20px;border-bottom:1px solid ${BRAND.borderLight};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" style="width:38px;height:38px;background:${BRAND.primaryContainer};border:1px solid ${BRAND.primaryContainerBorder};border-radius:12px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:20px;font-weight:900;color:${BRAND.primary};">a.</td>
                        <td style="padding-left:10px;">
                          <div style="font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:21px;font-weight:900;line-height:22px;letter-spacing:-0.4px;color:${BRAND.heading};">asif<span style="color:${BRAND.primary};">.to</span></div>
                          <div style="font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.primary};line-height:11px;">${escapeHtml(badgeText)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:5px 12px;background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:9999px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.8px;">Developer Learning</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content-cell" style="padding:36px 34px 32px;">
              <p style="margin:0 0 10px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;line-height:16px;color:${BRAND.primary};text-transform:uppercase;letter-spacing:1.2px;">${escapeHtml(eyebrow)}</p>
              <h1 class="email-title" style="margin:0 0 14px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:30px;font-weight:900;line-height:36px;letter-spacing:-0.5px;color:${BRAND.heading};">${escapeHtml(title)}</h1>
              <p style="margin:0 0 26px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:24px;color:${BRAND.body};">${intro}</p>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="padding:22px 34px 26px;background:${BRAND.surfaceLow};border-top:1px solid ${BRAND.borderLight};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:800;line-height:18px;color:${BRAND.heading};">Learn. Build. Revise.</p>
                    <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:18px;color:${BRAND.subtle};">&copy; ${new Date().getFullYear()} asif.to &nbsp;&bull;&nbsp; <a href="mailto:support@asif.to" style="color:${BRAND.primary};text-decoration:none;font-weight:700;">support@asif.to</a></p>
                  </td>
                </tr>
              </table>
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
export const sendOtpEmail = async (to, fullName, otp, purpose = "verification") => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const safeName = escapeHtml(fullName || "there");
  const safeOtp = escapeHtml(otp);
  const isReset = purpose === "forgot-password" || purpose === "reset-password";

  const subject = isReset
    ? `${otp} - Your asif.to password reset code`
    : `${otp} - Your asif.to verification code`;
  const eyebrow = isReset ? "Password reset" : "Account verification";
  const title = isReset
    ? `Reset your password, ${fullName || "there"}`
    : `Confirm your email, ${fullName || "there"}`;
  const intro = isReset
    ? `Hi ${safeName}, use the secure code below to reset your asif.to account password. It is valid for the next 10 minutes.`
    : `Hi ${safeName}, use the secure code below to finish setting up your account. It is valid for the next 10 minutes.`;

  await getTransporter().sendMail({
    from,
    to,
    subject,
    text: `Hi ${fullName || "there"},\n\nYour asif.to ${isReset ? "password reset" : "verification"} code is ${otp}. It expires in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.\n\nasif.to`,
    html: renderEmailLayout({
      preheader: `${otp} is your asif.to ${isReset ? "password reset" : "verification"} code. It expires in 10 minutes.`,
      eyebrow,
      title,
      intro,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${BRAND.primaryContainer};border:1px solid ${BRAND.primaryContainerBorder};border-radius:20px;">
          <tr>
            <td align="center" style="padding:26px 18px 28px;">
              <p style="margin:0 0 8px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:10px;font-weight:800;line-height:16px;color:${BRAND.primaryDark};text-transform:uppercase;letter-spacing:1px;">${isReset ? "Password Reset OTP" : "One-Time Verification Code"}</p>
              <div class="otp-code" style="font-family:'JetBrains Mono','Courier New',monospace;font-size:40px;font-weight:800;line-height:46px;letter-spacing:9px;color:${BRAND.primaryContainerInk};white-space:nowrap;">${safeOtp}</div>
            </td>
          </tr>
        </table>
        ${renderNotice(
          isReset
            ? `If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.`
            : `For your security, never share this code. asif.to will never ask you for it. If you did not create an account, you can safely ignore this email.`
        )}
        <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:19px;color:${BRAND.subtle};">Sent automatically by <strong style="color:${BRAND.muted};">noreply@asif.to</strong>. Please do not reply to this message.</p>`,
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
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:18px;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.heading};">Learn step-by-step</p>
                    <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Follow focused courses, interactive coding, and tutorials.</p>
                  </td>
                </tr>
              </table>
            </td>
            <td class="stack-cell stack-gap" width="50%" valign="top" style="padding-left:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:18px;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.heading};">Practice and revise</p>
                    <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Test skills with quizzes, flashcards, and quick cheatsheets.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${renderButton("Start learning now", siteUrl)}
        <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:21px;color:${BRAND.muted};">Need help? Reply to us at <a href="mailto:support@asif.to" style="font-weight:700;color:${BRAND.primary};text-decoration:none;">support@asif.to</a>.</p>`,
    }),
  });
};

/**
 * Send an invitation email to a new team/editorial user.
 */
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
      title: "You're invited to asif.to",
      badgeText: "Admin Workspace",
      intro: `You have been invited to join the asif.to workspace as <strong style="color:${BRAND.heading};">${escapeHtml(role)}</strong>. This secure invitation expires in seven days.`,
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
      badgeText: "Support Desk",
      intro: `A visitor submitted the contact form on asif.to. Replying to this email will respond directly to ${safeName}.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:18px;">
          <tr>
            <td width="92" valign="top" style="padding:16px 8px 8px 18px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;color:${BRAND.subtle};text-transform:uppercase;letter-spacing:0.5px;">From</td>
            <td style="padding:16px 18px 8px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:700;color:${BRAND.heading};">${safeName}</td>
          </tr>
          <tr>
            <td width="92" valign="top" style="padding:8px 8px 8px 18px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;color:${BRAND.subtle};text-transform:uppercase;letter-spacing:0.5px;">Email</td>
            <td style="padding:8px 18px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:${BRAND.heading};word-break:break-word;"><a href="mailto:${safeEmail}" style="font-weight:700;color:${BRAND.primary};text-decoration:none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td width="92" valign="top" style="padding:8px 8px 16px 18px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:800;color:${BRAND.subtle};text-transform:uppercase;letter-spacing:0.5px;">Subject</td>
            <td style="padding:8px 18px 16px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:${BRAND.heading};">${safeSubject}</td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;border-left:4px solid ${BRAND.primary};background:${BRAND.surfaceLow};border-radius:0 14px 14px 0;">
          <tr>
            <td style="padding:18px 20px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:23px;color:${BRAND.heading};word-break:break-word;">${safeMessage}</td>
          </tr>
        </table>
        ${renderButton(`Reply to ${name || "sender"}`, `mailto:${email}`)}`,
    }),
  });
};

/**
 * Security OTP used only by the protected two-admin course deletion workflow.
 * The requester and approver receive different codes tied to their user IDs.
 */
export const sendCourseDeletionOtpEmail = async ({
  to,
  fullName,
  otp,
  courseTitle,
  mode,
}) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const isApprover = mode === "approver";
  const safeName = escapeHtml(fullName || "administrator");
  const safeCourse = escapeHtml(courseTitle || "course");
  const safeOtp = escapeHtml(otp);

  await getTransporter().sendMail({
    from,
    to,
    subject: `${otp} - ${
      isApprover ? "Approve" : "Confirm"
    } deletion of ${courseTitle}`,
    text: `Hi ${fullName || "administrator"},\n\nYour protected course deletion ${isApprover ? "approval" : "request"} code is ${otp}.\n\nCourse: ${courseTitle}\nThis code expires in 10 minutes.\n\nDo not forward or share this code. The requester and second approver must be different administrator accounts.\n\nasif.to`,
    html: renderEmailLayout({
      preheader: `${otp} is your protected course deletion code. It expires in 10 minutes.`,
      eyebrow: isApprover
        ? "Independent deletion approval"
        : "Protected deletion request",
      badgeText: "Admin Security",
      title: isApprover
        ? `Review deletion of ${courseTitle}`
        : `Confirm deletion request`,
      intro: `Hi ${safeName}, this code authorizes a permanent destructive action for <strong style="color:${BRAND.heading};">${safeCourse}</strong>. It is valid for 10 minutes.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${BRAND.dangerContainer};border:1px solid ${BRAND.dangerBorder};border-radius:20px;">
          <tr>
            <td align="center" style="padding:26px 18px 28px;">
              <p style="margin:0 0 8px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:10px;font-weight:800;line-height:16px;color:${BRAND.danger};text-transform:uppercase;letter-spacing:1px;">Critical Security OTP</p>
              <div class="otp-code" style="font-family:'JetBrains Mono','Courier New',monospace;font-size:40px;font-weight:800;line-height:46px;letter-spacing:9px;color:${BRAND.dangerInk};white-space:nowrap;">${safeOtp}</div>
            </td>
          </tr>
        </table>
        ${renderNotice(
          isApprover
            ? "You are the independent second administrator. Review the selected cascade items in admin.asif.to before entering this code. Never approve a request you did not inspect."
            : "This is only the first gate. Nothing is deleted after your OTP alone. A different admin/super admin must independently review the request and verify a separate OTP.",
        )}
        <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:19px;color:${BRAND.subtle};">Never share this OTP in chat, email, screenshots, or messages.</p>`,
    }),
  });
};

export const sendCourseDeletionApprovalRequestEmail = async ({
  to,
  fullName,
  courseTitle,
  requesterName,
  requestId,
}) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const adminUrl = (
    process.env.ADMIN_URL ||
    process.env.ADMIN_CLIENT_URL ||
    "https://admin.asif.to"
  ).replace(/\/$/, "");
  const reviewUrl = `${adminUrl}/courses?deletionRequest=${requestId}`;

  await getTransporter().sendMail({
    from,
    to,
    subject: `Approval required: delete ${courseTitle}`,
    text: `${requesterName} requested permanent deletion of ${courseTitle}.\n\nReview the exact cascade selections before approving:\n${reviewUrl}\n\nYou must request and enter your own approval OTP. The requester cannot approve their own deletion.`,
    html: renderEmailLayout({
      preheader: `A protected deletion request for ${courseTitle} requires a second administrator.`,
      eyebrow: "Critical admin approval",
      badgeText: "Admin Security",
      title: `Deletion approval required`,
      intro: `<strong style="color:${BRAND.heading};">${escapeHtml(
        requesterName,
      )}</strong> requested permanent deletion of <strong style="color:${BRAND.heading};">${escapeHtml(
        courseTitle,
      )}</strong>. A second administrator must independently inspect the cascade selections before anything is deleted.`,
      content: `${renderButton("Review deletion request", reviewUrl)}${renderNotice(
        "Opening the request does not delete anything. If you choose to approve, admin.asif.to sends a separate OTP to your own admin email. The requester cannot use or approve with that OTP.",
      )}`,
    }),
  });
};

/**
 * Sent to a user immediately after they deactivate their account.
 * Lets them know they can sign back in any time to reactivate.
 */
export const sendAccountDeactivatedEmail = async (to, fullName) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const siteUrl = getSiteUrl();
  const safeName = escapeHtml(fullName || "there");

  await getTransporter().sendMail({
    from,
    to,
    subject: "Your asif.to account has been deactivated",
    text: `Hi ${fullName || "there"},\n\nYour asif.to account has been successfully deactivated.\n\nWe'll miss you! Whenever you're ready to come back, simply sign in at ${siteUrl}/login and your account will be instantly reactivated — no hoops, no waiting.\n\nYour learning progress, bookmarks, and certificates are all safely stored and will be right where you left them.\n\nWe hope to see you again.\n\nasif.to`,
    html: renderEmailLayout({
      preheader:
        "Your asif.to account is deactivated. Come back any time to reactivate it instantly.",
      eyebrow: "Account deactivated",
      badgeText: "Account",
      title: `We'll miss you, ${fullName || "there"} 💙`,
      intro: `Hi ${safeName}, your asif.to account has been successfully deactivated. We're sorry to see you go — but the door is always open.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${BRAND.primaryContainer};border:1px solid ${BRAND.primaryContainerBorder};border-radius:20px;">
          <tr>
            <td style="padding:22px 24px;">
              <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.primaryContainerInk};">Coming back is easy</p>
              <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:20px;color:${BRAND.primaryContainerInk};">Simply sign in at asif.to any time and your account will be <strong>instantly reactivated</strong>. Your progress, bookmarks, and certificates are all safely preserved.</p>
            </td>
          </tr>
        </table>
        ${renderButton("Sign in to reactivate", `${siteUrl}/login`)}
        ${renderNotice(
          `If you ever need help, reach out to <a href='mailto:support@asif.to' style='color:${BRAND.primary};font-weight:700;text-decoration:none;'>support@asif.to</a>.`,
        )}
        <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:19px;color:${BRAND.subtle};">Sent automatically by <strong style="color:${BRAND.muted};">noreply@asif.to</strong>. Please do not reply to this message.</p>`,
    }),
  });
};

/**
 * Sent to a user immediately after they request account deletion.
 * Explains the 30-day grace window to restore and what happens to published content.
 */
export const sendAccountDeletedEmail = async (to, fullName) => {
  const from = process.env.EMAIL_FROM || "asif.to <noreply@asif.to>";
  const siteUrl = getSiteUrl();
  const safeName = escapeHtml(fullName || "there");
  const restoreDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  await getTransporter().sendMail({
    from,
    to,
    subject: "Your asif.to account deletion request",
    text: `Hi ${fullName || "there"},\n\nWe've received your request to delete your asif.to account.\n\nWe'll miss you more than you know. The dev community you've been part of here is a little smaller without you.\n\nYou have until ${restoreDeadline} to change your mind. Simply sign in at ${siteUrl}/login within the next 30 days and your account will be fully restored.\n\nAfter ${restoreDeadline}, your account will be permanently removed. Your published articles and course contributions will remain preserved so the community can still benefit from your work.\n\nIf you'd like to discuss your account, contact us at support@asif.to.\n\nTake care,\nasif.to`,
    html: renderEmailLayout({
      preheader: `You have 30 days to restore your asif.to account. We'll miss you!`,
      eyebrow: "Account deletion requested",
      badgeText: "Account",
      title: `Goodbye for now, ${fullName || "there"} 👋`,
      intro: `Hi ${safeName}, we've received your request to delete your asif.to account. We're genuinely sad to see you go — you've been a valued part of our learning community.`,
      content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${BRAND.primaryContainer};border:1px solid ${BRAND.primaryContainerBorder};border-radius:20px;">
          <tr>
            <td style="padding:22px 24px;">
              <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.primaryContainerInk};">Changed your mind? You have 30 days.</p>
              <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;line-height:20px;color:${BRAND.primaryContainerInk};">Simply sign in before <strong>${escapeHtml(restoreDeadline)}</strong> and your account will be <strong>fully restored</strong> — all your progress, bookmarks, and certificates intact.</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
          <tr>
            <td class="stack-cell" width="50%" valign="top" style="padding-right:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:18px;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.heading};">Your content stays</p>
                    <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Articles and course contributions you've published remain preserved so the community still benefits from your work.</p>
                  </td>
                </tr>
              </table>
            </td>
            <td class="stack-cell stack-gap" width="50%" valign="top" style="padding-left:6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceLow};border:1px solid ${BRAND.border};border-radius:18px;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 6px;font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;color:${BRAND.heading};">Data removed after 30 days</p>
                    <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:18px;color:${BRAND.muted};">Your personal profile, bookmarks, quiz history, and private data will be permanently deleted after the grace window closes.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${renderButton("Restore my account", `${siteUrl}/login`)}
        ${renderNotice(
          `If you did not request this deletion or believe this was done in error, contact us immediately at <a href='mailto:support@asif.to' style='color:${BRAND.primary};font-weight:700;text-decoration:none;'>support@asif.to</a>.`,
        )}
        <p style="margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;line-height:19px;color:${BRAND.subtle};">Sent automatically by <strong style="color:${BRAND.muted};">noreply@asif.to</strong>. Please do not reply to this message.</p>`,
    }),
  });
};
