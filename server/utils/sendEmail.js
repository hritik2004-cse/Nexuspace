const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  // Note: For production, you should configure this with real SMTP credentials (e.g., SendGrid, Mailgun, AWS SES)
  // For development/fallback, we'll use a mocked/test approach or rely on environment variables
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || "test",
      pass: process.env.SMTP_PASSWORD || "test",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "Nexuspace"} <${process.env.FROM_EMAIL || "noreply@nexuspace.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    // If we're using placeholder credentials, just log the email to the console
    if (process.env.SMTP_EMAIL === "test" || error.code === 'EAUTH') {
      console.log("==================================================");
      console.log("⚠️ SMTP Authentication Failed (Mock Mode)");
      console.log("To: ", options.email);
      console.log("Subject: ", options.subject);
      console.log("Message: \n", options.message);
      console.log("==================================================");
      return; // Return success anyway so the frontend flow works during dev
    }
    throw error;
  }
};

module.exports = sendEmail;
