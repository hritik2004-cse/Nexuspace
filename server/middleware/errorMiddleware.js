const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let code = 'SERVER_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.message.includes('Not authorized') || err.message.includes('expired')) {
    statusCode = 401;
    code = 'AUTH_EXPIRED';
  } else if (err.message.includes('Permission') || err.message.includes('CSRF')) {
    statusCode = 403;
    code = 'PERMISSION_DENIED';
  }

  const isProd = process.env.NODE_ENV === 'production';

  // Actionable Logging
  const logData = {
    requestId: req.requestId || 'unknown',
    userId: req.user ? req.user._id : 'unauthenticated',
    method: req.method,
    route: req.originalUrl,
    statusCode,
    latencyMs: req.startTime ? Date.now() - req.startTime : 0,
    outcome: 'fail',
    errorMessage: err.message
  };

  if (statusCode >= 500) {
    console.error('[ERROR]', logData, '\nStack:', err.stack);
  } else {
    console.warn('[WARN]', logData);
  }

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode === 500 ? 'Internal Server Error' : err.message,
    code,
    requestId: req.requestId || 'unknown',
    ...(isProd ? {} : { details: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const requestLogger = (req, res, next) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    // Only log successful requests here (errors logged in errorHandler)
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log('[INFO]', {
        requestId: req.requestId || 'unknown',
        userId: req.user ? req.user._id : 'unauthenticated',
        method: req.method,
        route: req.originalUrl,
        statusCode: res.statusCode,
        latencyMs: Date.now() - req.startTime,
        outcome: 'success'
      });
    }
  });
  
  next();
};

module.exports = { errorHandler, asyncHandler, requestLogger };
