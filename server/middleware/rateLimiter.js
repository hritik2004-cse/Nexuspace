const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');

/**
 * Distributed Rate Limiting Middleware
 * Uses Redis to synchronize limits across multiple server instances.
 */

// 1. IP-based limiter (10 per minute)
const ipLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:ip:'
  }),
  windowMs: 60 * 1000,
  max: 10,
  message: { 
    success: false, 
    code: 'TOO_MANY_REQUESTS_IP', 
    message: 'Too many requests from this IP. Please try again in a minute.',
    retryable: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// 2. User-based limiter (5 per minute)
const userLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:user:'
  }),
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { 
    success: false, 
    code: 'TOO_MANY_REQUESTS_USER', 
    message: 'Action frequency exceeded. Please slow down.',
    retryable: true
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Global Burst Guard (already in server.js, but this is a stricter one for sensitive ops)
const sensitiveOpLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:burst:'
  }),
  windowMs: 10 * 1000, // 10 seconds
  max: 3,
  message: { 
    success: false, 
    code: 'BURST_LIMIT_EXCEEDED', 
    message: 'System is busy. Please wait a few seconds.',
    retryable: true
  }
});

module.exports = {
  ipLimiter,
  userLimiter,
  sensitiveOpLimiter
};
