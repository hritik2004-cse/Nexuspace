const sendEmail = require('../utils/sendEmail');

/**
 * @desc  Subscribe to the Nexuspace newsletter & receive a welcome email
 * @route POST /api/newsletter/subscribe
 * @access Public
 */
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #030014; margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; background: #030014; padding: 40px 20px; }
    .card { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -1px; margin-bottom: 30px; }
    .logo span { color: #6366f1; }
    h1 { font-size: 32px; font-weight: 900; line-height: 1.2; margin-bottom: 20px; background: linear-gradient(to right, #ffffff, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #94a3b8; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5); }
    .footer { margin-top: 40px; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">NEXUS<span>PACE</span></div>
      <h1>Welcome to the Future of Flow.</h1>
      <p>You've successfully subscribed to the Nexuspace Changelog. Get ready for sub-millisecond updates on the world's most agonizingly fast command center.</p>
      <a href="https://project-nexuspace.vercel.app" class="btn">Launch Workspace</a>
      <div class="footer">
        © ${new Date().getFullYear()} Nexuspace Inc. <br>
        You received this because you subscribed at nexuspace.com
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      email: cleanEmail,
      subject: '🚀 Welcome to Nexuspace',
      message: `Welcome to Nexuspace! You're now subscribed to the changelog.`,
      html: welcomeHtml
    });

    return res.status(200).json({
      success: true,
      message: "You're subscribed! Check your inbox."
    });
  } catch (error) {
    console.error('[Newsletter Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send welcome email.' });
  }
};

module.exports = { subscribeNewsletter };
