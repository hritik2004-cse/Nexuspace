const { asyncHandler } = require('../middleware/errorMiddleware');
const authService = require('../services/authService');

/**
 * @desc    Helper to set token in cookie
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const userData = await authService.registerUserService(req.body);
  setTokenCookie(res, userData.token);
  res.status(201).json(userData);
});

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userData = await authService.loginUserService(email, password);
  setTokenCookie(res, userData.token);
  res.status(200).json(userData);
});

/**
 * @desc    Google OAuth Login
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Please provide the Google OAuth credential string');
  }

  const userData = await authService.googleLoginService(credential);
  setTokenCookie(res, userData.token);
  res.status(200).json(userData);
});

/**
 * @desc    Logout user / Clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfileService(req.user._id);
  res.status(200).json(user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateUserProfileService(req.user._id, req.body);
  res.status(200).json(updatedUser);
});

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePasswordService(req.user._id, oldPassword, newPassword);
  res.status(200).json(result);
});

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
};
