import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    
    if (process.env.NODE_ENV === "development") {
      console.log("=".repeat(50));
      console.log("📧 EMAIL SENT (Development Mode)");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Content:", html);
      console.log("=".repeat(50));
      return;
    }

    
  const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


    await transporter.sendMail({
      from: '"SwadBox" <noreply@swadbox.com>',
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
