const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, updateProfile, refreshToken, logoutUser, logoutAll, getMe, forgotPassword, resetPassword, sendPhoneOtp, verifyPhoneOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many login attempts, please try again later", code: "RATE_LIMIT_EXCEEDED" },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: "Too many password reset requests, please try again after an hour", code: "RATE_LIMIT_EXCEEDED" },
});

router.post('/register', registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logoutUser);
router.post('/logout-all', protect, logoutAll);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Phone Verification
router.post('/send-phone-otp', protect, sendPhoneOtp);
router.post('/verify-phone-otp', protect, verifyPhoneOtp);

module.exports = router;
