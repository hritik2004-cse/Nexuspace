const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, logoutUser, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');



// POST api/auth/register  register a new user with email and password
router.post('/register', registerUser);

// POST api/auth/login login with email and password
router.post('/login', loginUser);

// POST api/auth/google login with Google
router.post('/google', googleLogin);

// POST api/auth/logout logout current user and clear cookie
router.post('/logout', logoutUser);

// GET api/auth/me get current user's profile
router.get('/me', protect, getMe);

// PUT api/auth/update-profile update current user's profile
router.put('/update-profile', protect, updateProfile);

// PUT api/auth/change-password change current user's password
router.put('/change-password', protect, changePassword);

module.exports = router;
