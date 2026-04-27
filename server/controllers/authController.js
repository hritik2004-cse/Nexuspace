const { asyncHandler } = require('../middleware/errorMiddleware');
const authService = require('../services/authService');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
};

const setAuthCookies = (res, tokens, sessionId) => {
  // Access Token: 15 mins
  res.cookie('access_token', tokens.accessToken, {
    ...cookieOptions,
    httpOnly: true,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token: 15 days
  res.cookie('refresh_token', tokens.refreshToken, {
    ...cookieOptions,
    httpOnly: true,
    path: '/api/auth/refresh',
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  // CSRF Token: HMAC of sessionId
  const serverSecret = process.env.JWT_SECRET || 'secret';
  const csrfToken = crypto.createHmac('sha256', serverSecret).update(sessionId).digest('hex');

  res.cookie('csrf_token', csrfToken, {
    ...cookieOptions,
    httpOnly: false, // Must be readable by frontend JS
    path: '/',
    maxAge: 15 * 24 * 60 * 60 * 1000, // Same as refresh session
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const sessionId = uuidv4();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const { user, tokens } = await authService.registerLocalService({ name, email, password, sessionId, ip, userAgent });
    setAuthCookies(res, tokens, sessionId);
    res.status(201).json(user);
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

  const sessionId = uuidv4();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const { user, tokens } = await authService.loginLocalService({ email, password, sessionId, ip, userAgent });
    setAuthCookies(res, tokens, sessionId);
    res.status(200).json(user);
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

  const sessionId = uuidv4();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const { user, tokens } = await authService.googleLoginService(credential, sessionId, ip, userAgent);
  setAuthCookies(res, tokens, sessionId);
  res.status(200).json(user);
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    // Service handles token rotation, reuse detection, grace windows, and session locking
    const { user, tokens, sessionId } = await authService.refreshTokenService(token, ip, userAgent);
    setAuthCookies(res, tokens, sessionId);
    res.status(200).json(user);
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;
  if (token) {
    await authService.revokeSession(token);
  }
  
  res.clearCookie('access_token', { ...cookieOptions, path: '/' });
  res.clearCookie('refresh_token', { ...cookieOptions, path: '/api/auth/refresh' });
  res.clearCookie('csrf_token', { ...cookieOptions, path: '/' });
  
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const logoutAll = asyncHandler(async (req, res) => {
  // Global logout by incrementing sessionVersion
  await authService.globalLogout(req.user._id);

  res.clearCookie('access_token', { ...cookieOptions, path: '/' });
  res.clearCookie('refresh_token', { ...cookieOptions, path: '/api/auth/refresh' });
  res.clearCookie('csrf_token', { ...cookieOptions, path: '/' });
  
  res.status(200).json({ success: true, message: 'Logged out from all devices' });
});

const getMe = asyncHandler(async (req, res) => {
  // Re-fetch user to make sure we have latest data
  const User = require('../models/User');
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { profileImage, channels, name, username, bio, customTitle } = req.body;
  const User = require('../models/User');

  let updateFields = {};

  if (name) updateFields.name = name;
  if (username) updateFields.username = username;
  if (bio !== undefined) updateFields.bio = bio;
  if (customTitle !== undefined) updateFields.customTitle = customTitle;
  if (channels) updateFields.channels = channels;

  // Cloudinary Upload Logic
  if (profileImage && profileImage.startsWith('data:image')) {
    const cloudinary = require('../config/cloudinary');
    try {
      const uploadRes = await cloudinary.uploader.upload(profileImage, {
        folder: 'nexuspace/profiles',
        width: 500,
        height: 500,
        crop: 'fill'
      });
      updateFields.avatar = uploadRes.secure_url;
      updateFields.profileImage = uploadRes.secure_url; 
    } catch (err) {
      console.error(err);
      res.status(500);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  if (Object.keys(updateFields).length > 0) {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } else {
    res.status(400);
    throw new Error('No valid updates provided or user not found');
  }
});

const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const User = require('../models/User');
  const user = await User.findOne({ email });

  if (!user) {
    // Prevent email enumeration
    return res.status(200).json({ success: true, message: 'If an account exists, a reset code was sent.' });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  const hashedCode = await bcrypt.hash(resetCode, salt);

  user.resetPasswordToken = hashedCode;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Nexuspace Password Reset Code',
      message: `Your password reset code is: ${resetCode}\nIt expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Password Reset</h2>
          <p>You requested a password reset. Your 6-digit code is:</p>
          <h1 style="background: #f1f5f9; padding: 15px; text-align: center; letter-spacing: 5px; color: #1e293b; border-radius: 8px;">${resetCode}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.error(err);
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const User = require('../models/User');

  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error('Please provide email, code, and new password');
  }

  const user = await User.findOne({
    email,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user || !user.resetPasswordToken) {
    res.status(400);
    throw new Error('Invalid or expired code');
  }

  const isMatch = await bcrypt.compare(code, user.resetPasswordToken);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid code');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.sessionVersion += 1; // Revoke all sessions
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  logoutUser,
  logoutAll,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
