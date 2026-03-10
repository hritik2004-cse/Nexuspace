const { asyncHandler } = require('../middleware/errorMiddleware');
const authService = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  // Mock registration entry point for local accounts
  res.status(201).json({ message: 'Register endpoint ready' });
});

const loginUser = asyncHandler(async (req, res) => {
  // Mock login entry point for local accounts
  res.status(200).json({ message: 'Login endpoint ready' });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Please provide the Google OAuth credential string');
  }

  // Pass data to service layer
  const userData = await authService.googleLoginService(credential);

  res.status(200).json(userData);
});

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
};
