const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, updateProfile, refreshToken, logoutUser, logoutAll, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many login attempts, please try again later", code: "RATE_LIMIT_EXCEEDED" },
});

router.post('/register', registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logoutUser);
router.post('/logout-all', protect, logoutAll);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
