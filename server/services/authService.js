const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateUniqueUsername = async (baseName) => {
  const base = baseName.toLowerCase().replace(/\s+/g, '_');
  let username = base;
  let counter = 0;
  
  while (await User.exists({ username })) {
    username = `${base}_${Math.random().toString(36).substring(2, 6)}`;
    if (counter++ > 5) break; // Avoid infinite loops
  }
  return username;
};

const formatUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  ...(token && { token })
});

const googleLoginService = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub, email, name, picture } = ticket.getPayload();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      googleId: sub,
      name,
      username: await generateUniqueUsername(name),
      email,
      avatar: picture,
      provider: 'google',
    });
  }

  return formatUserResponse(user, generateToken(user._id));
};

const registerUserService = async ({ name, email, username, password, role }) => {
  if (!name || !email || !password) throw new Error('Missing required fields');

  if (await User.exists({ $or: [{ email }, { username: username || '' }] })) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    username: username || (await generateUniqueUsername(name)),
    password,
    role: role || 'Member',
    provider: 'local',
  });

  return formatUserResponse(user, generateToken(user._id));
};

const loginUserService = async (email, password) => {
  if (!email || !password) throw new Error('Missing email or password');

  const user = await User.findOne({ email });
  if (!user || user.provider !== 'local' || !(await user.matchPassword(password))) {
    throw new Error(user?.provider !== 'local' ? `Login via ${user.provider}` : 'Invalid credentials');
  }

  return formatUserResponse(user, generateToken(user._id));
};

const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserProfileService = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (data.username && data.username !== user.username) {
    if (await User.exists({ username: data.username })) throw new Error('Username taken');
    user.username = data.username;
  }

  user.name = data.name || user.name;
  user.avatar = data.avatar || user.avatar;
  
  await user.save();
  return formatUserResponse(user);
};

const changePasswordService = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user || user.provider !== 'local') throw new Error('Invalid request');

  if (!(await user.matchPassword(oldPassword))) throw new Error('Incorrect old password');
 
  user.password = newPassword;
  await user.save();
  return { success: true, message: 'Password updated' };
};

module.exports = {
  googleLoginService,
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
  generateToken
};
