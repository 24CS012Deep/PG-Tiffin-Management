import nodemailer from "nodemailer";

// ✅ FIX: Create transporter ONCE at module level — not inside the function.
// Creating it per-call (and calling verify() every time) causes SMTP timeouts
// and is the #1 reason emails silently fail.
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
    }
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log("📧 Nodemailer transporter initialized");
  }
  return transporter;
};

// ✅ sendEmail now THROWS on failure with structured diagnostics.
// Previously a failed send showed a generic error. Now it includes:
// - SMTP error code (e.g. 535 = Bad credentials, 421 = rate limit)
// - SMTP server response string
// - Setup guide link for the most common cause (Gmail App Password)
const sendEmail = async ({ to, subject, html }) => {
  console.log("📧 Sending email to:", to, "| Subject:", subject);

  const mailer = getTransporter();

  try {
    const info = await mailer.sendMail({
      from: `"SwadBox" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to: ${to} | ID: ${info.messageId}`);
    return info;
  } catch (err) {
    // Expose SMTP-level error details for easier debugging
    console.error("❌ SMTP error:", {
      message: err.message,
      code: err.code,
      responseCode: err.responseCode,
      response: err.response,
    });

    // If it's an auth failure, surface a helpful hint
    if (err.responseCode === 535 || err.code === "EAUTH") {
      console.error(
        "💡 HINT: Gmail auth failed. Make sure:\n" +
        "  1. 2-Step Verification is ON for " + process.env.EMAIL_USER + "\n" +
        "  2. EMAIL_PASS in .env is a Gmail App Password (16 chars, no spaces)\n" +
        "  3. App Passwords: https://myaccount.google.com/apppasswords"
      );
    }

    // Reset transporter on auth failure so next request retries with fresh connection
    if (err.responseCode === 535 || err.code === "EAUTH" || err.code === "ECONNRESET") {
      transporter = null;
    }

    throw err; // Re-throw so callers can catch and log
  }
};

export default sendEmail;