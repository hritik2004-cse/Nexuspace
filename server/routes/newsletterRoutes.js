const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController');
const rateLimit = require('express-rate-limit');

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many subscription requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  validate: { trustProxy: false },
});

router.post('/subscribe', newsletterLimiter, subscribeNewsletter);

module.exports = router;
