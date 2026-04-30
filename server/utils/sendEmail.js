const emailjs = require('@emailjs/nodejs');

const sendEmail = async (options) => {
  try {
    // We only send the email and the content. 
    // No name input required.
    const templateParams = {
      to_email: options.email,
      subject: options.subject,
      html_content: options.html || '',
    };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log('🚀 Email Sent to:', options.email);
    return response;
  } catch (error) {
    console.error('❌ EmailJS Error:', error);
    throw error;
  }
};

module.exports = sendEmail;
