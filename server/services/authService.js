const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateUniqueUsername = async (baseName) => {
  let username = baseName.toLowerCase().replace(/\s+/g, '_');
  let exists = await User.findOne({ username });
  
  if (!exists) return username;

  // If exists, append random characters
  while (exists) {
    const suffix = Math.random().toString(36).substring(2, 6);
    username = `${baseName.toLowerCase().replace(/\s+/g, '_')}_${suffix}`;
    exists = await User.findOne({ username });
  }
  
  return username;
};

const googleLoginService = async (credential) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    const username = await generateUniqueUsername(name);
    user = await User.create({
      googleId: sub,
      name,
      username,
      email,
      avatar: picture,
      provider: 'google',
    });

    const Workspace = require('../models/Workspace');
    await Workspace.create({
      name: 'Google Sandbox',
      owner: user._id,
      members: [user._id]
    });
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    token,
  };
};

const registerLocalService = async ({ name, email, password }) => {
  let user = await User.findOne({ email });

  if (user) {
    throw new Error('User already exists');
  }

  const username = await generateUniqueUsername(name);

  const newUser = await User.create({
    name,
    email,
    password,
    username,
    provider: 'local',
  });

  const Workspace = require('../models/Workspace');
  await Workspace.create({
    name: 'My Sandbox',
    owner: newUser._id,
    members: [newUser._id]
  });

  const token = generateToken(newUser._id);

  return {
    _id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    role: newUser.role,
    token,
  };
};

const loginLocalService = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    token,
  };
};

module.exports = {
  googleLoginService,
  registerLocalService,
  loginLocalService,
  generateToken
};
