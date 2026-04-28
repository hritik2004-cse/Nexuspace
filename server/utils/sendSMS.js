/**
 * sendSMS Utility
 * 
 * In a real production environment, this would use a service like Twilio, Nexmo, or MessageBird.
 * For this project, we're implementing a "Simulation Mode" that logs the OTP to the console.
 */

const sendSMS = async ({ phoneNumber, message }) => {
  console.log(`\n--- [SMS SIMULATOR] ---`);
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: ${message}`);
  console.log(`-----------------------\n`);

  // To implement Twilio:
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  */
  
  return true;
};

module.exports = sendSMS;
