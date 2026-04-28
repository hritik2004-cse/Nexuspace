const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
  // Only enforce on mutating routes
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Bypass auth initialization routes
  const exemptRoutes = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/google', 
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  if (exemptRoutes.includes(req.originalUrl)) {
    return next();
  }

  // 3. Bypass if Bearer Token is used (immune to CSRF as it's not auto-sent by browser)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies.csrf_token;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403);
    return next(new Error('CSRF validation failed'));
  }

  // Bind to session (req.sessionId is set by authMiddleware `protect`)
  // Since CSRF happens after `protect`, we can verify the HMAC
  if (req.sessionId) {
    const serverSecret = process.env.JWT_SECRET || 'secret';
    const expectedToken = crypto.createHmac('sha256', serverSecret).update(req.sessionId).digest('hex');
    
    if (headerToken !== expectedToken) {
      res.status(403);
      return next(new Error('CSRF token bound to incorrect session'));
    }
  }

  next();
};

module.exports = { csrfProtection };
