const { asyncHandler } = require('../middleware/errorMiddleware');
const authService = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  try {
    const userData = await authService.registerLocalService({ name, email, password });
    res.status(201).json(userData);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  try {
    const userData = await authService.loginLocalService({ email, password });
    res.status(200).json(userData);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
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
