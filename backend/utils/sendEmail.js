import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Log email configuration (remove in production)
    console.log("📧 Email Configuration:", {
      user: process.env.EMAIL_USER ? "✓ Set" : "✗ Missing",
      pass: process.env.EMAIL_PASS ? "✓ Set" : "✗ Missing",
      to
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email credentials missing in .env file");
      return { success: false, error: "Email credentials missing" };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // Use 587 instead of 465 for better compatibility
      secure: false, // false for 587, true for 465
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Helps with some hosting issues
      }
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ SMTP Connection verified");

    const info = await transporter.sendMail({
      from: `"SwadBox" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to: ${to}`);
    console.log("📨 Message ID:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    console.error("Error details:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;