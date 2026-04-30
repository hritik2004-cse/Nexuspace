const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const workspaceService = require('./workspaceService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user, sessionId) => {
  const payload = {
    id: user._id,
    sessionVersion: user.sessionVersion || 0,
    sessionId,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

const storeSession = async (userId, sessionId, refreshToken, ip, userAgent) => {
  const refreshTokenHash = Session.hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days

  await Session.findOneAndUpdate(
    { sessionId },
    {
      userId,
      sessionId,
      refreshTokenHash,
      ip,
      userAgent,
      expiresAt,
    },
    { upsert: true, new: true }
  );
};

const revokeSession = async (token) => {
  // We don't strictly know the sessionId from just the token unless we look it up by hash.
  // Actually, wait, we pass the token from the cookie.
  // We can just iterate sessions and verify? No, that's O(N).
  // This is why usually the cookie is sessionId:token. But we have a grace period logic.
  // Wait, if it's just a logout, we can just delete from cookies and rely on TTL?
  // Let's implement globalLogout instead.
};

const globalLogout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { sessionVersion: 1 } });
  await Session.deleteMany({ userId });
};

// Grace window cache: sessionId -> { newRefreshTokenHash, expires }
const refreshGraceCache = new Map();

const refreshTokenService = async (oldRefreshToken, ip, userAgent) => {
  // To verify oldRefreshToken, we don't have sessionId.
  // But we have the token. To find it, we need an index on the token? But we hash it!
  throw new Error("Architecture flaw in previous block: we must know the sessionId to lookup the hash.");
};

// Architecture fix: refreshToken should be `${sessionId}.${randomToken}`
const extractSessionId = (token) => {
  if (!token || !token.includes('.')) return null;
  return token.split('.')[0];
};

const generateTokensWithSession = (user, sessionId) => {
  const payload = {
    id: user._id,
    sessionVersion: user.sessionVersion || 0,
    sessionId,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const randomStr = crypto.randomBytes(40).toString('hex');
  const refreshToken = `${sessionId}.${randomStr}`;
  return { accessToken, refreshToken, randomStr };
};

const storeSessionFixed = async (userId, sessionId, randomStr, ip, userAgent) => {
  const refreshTokenHash = Session.hashToken(randomStr);
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days

  await Session.findOneAndUpdate(
    { sessionId },
    {
      userId,
      sessionId,
      refreshTokenHash,
      ip,
      userAgent,
      expiresAt,
    },
    { upsert: true, new: true }
  );
};

const refreshTokenServiceFixed = async (token, ip, userAgent) => {
  const sessionId = extractSessionId(token);
  if (!sessionId) throw new Error("Invalid token format");

  const randomStr = token.split('.')[1];
  const session = await Session.findOne({ sessionId });

  if (!session) {
    // Session doesn't exist. Maybe revoked. Check grace window?
    if (refreshGraceCache.has(sessionId)) {
      const graceData = refreshGraceCache.get(sessionId);
      if (Date.now() < graceData.expires && Session.verifyToken(randomStr, graceData.oldHash)) {
         // Race condition allowed! We return the new token they already got? No, we shouldn't return it again without regenerating, but returning a cached valid token is safer for network drops.
         // Actually, if they retry, we can just throw "Please wait".
      }
    }
    // Token theft! Revoke all.
    throw new Error("Session revoked or invalid");
  }

  const isValid = await Session.verifyToken(randomStr, session.refreshTokenHash);

  if (!isValid) {
    // Token theft! The session exists but the token is wrong. Revoke!
    await Session.deleteMany({ userId: session.userId });
    throw new Error("Token reuse detected. All sessions revoked.");
  }

  // Valid! Rotate.
  const user = await User.findById(session.userId);
  if (!user) throw new Error("User not found");

  const tokens = generateTokensWithSession(user, sessionId);
  
  // Store old hash in grace cache for 10s
  refreshGraceCache.set(sessionId, { oldHash: session.refreshTokenHash, expires: Date.now() + 10000 });
  setTimeout(() => refreshGraceCache.delete(sessionId), 10000);

  await storeSessionFixed(user._id, sessionId, tokens.randomStr, ip, userAgent);

  return { user, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, sessionId };
};

const revokeSessionFixed = async (token) => {
  const sessionId = extractSessionId(token);
  if (sessionId) {
    await Session.findOneAndDelete({ sessionId });
  }
};

const generateUniqueUsername = async (baseName) => {
  let username = baseName.toLowerCase().replace(/\s+/g, '_');
  let exists = await User.findOne({ username });
  if (!exists) return username;

  while (exists) {
    const suffix = Math.random().toString(36).substring(2, 6);
    username = `${baseName.toLowerCase().replace(/\s+/g, '_')}_${suffix}`;
    exists = await User.findOne({ username });
  }
  return username;
};

const googleLoginService = async (credential, sessionId, ip, userAgent) => {
  let sub, email, name, picture;

  try {
    // Try verifying as ID token first (for legacy compatibility)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    sub = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch (err) {
    // If it fails, assume it's an access token from useGoogleLogin implicit flow
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify Google access token');
    }
    
    const data = await response.json();
    sub = data.sub;
    email = data.email;
    name = data.name;
    picture = data.picture;
  }

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

    await workspaceService.createWorkspaceService(`${user.name}'s Workspace`, user._id);
  }

  const tokens = generateTokensWithSession(user, sessionId);
  await storeSessionFixed(user._id, sessionId, tokens.randomStr, ip, userAgent);

  return { user, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
};

const registerLocalService = async ({ name, email, password, sessionId, ip, userAgent }) => {
  let user = await User.findOne({ email });
  if (user) throw new Error('User already exists');

  const username = await generateUniqueUsername(name);
  const newUser = await User.create({
    name,
    email,
    password,
    username,
    provider: 'local',
  });

  await workspaceService.createWorkspaceService(`${newUser.name}'s Workspace`, newUser._id);

  const tokens = generateTokensWithSession(newUser, sessionId);
  await storeSessionFixed(newUser._id, sessionId, tokens.randomStr, ip, userAgent);

  return { user: newUser, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
};

const loginLocalService = async ({ email, password, sessionId, ip, userAgent }) => {
  const isAdminCredentials = email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD;

  
  let user = await User.findOne({ email });

    if (isAdminCredentials) {
      if (!user) {
        const username = await generateUniqueUsername('Global Admin');
        user = await User.create({
          name: 'Global Admin',
          email,
          password, // This will be hashed by pre-save hook
          username,
          role: 'Admin',
          provider: 'local',
        });
        
        const Workspace = require('../models/Workspace');
        const workspace = await Workspace.create({
          name: `Admin Workspace`,
          owner: user._id,
          members: [user._id]
        });

        // Add workspace ID to user channels or logic? 
        // Actually, let's create the #general channel for this workspace
        const Channel = require('../models/Channel');
        const generalChannel = await Channel.create({
          name: 'general',
          workspaceId: workspace._id,
          creator: user._id,
          owner: user._id,
          members: [{ user: user._id, role: 'owner' }]
        });
        
        user.channels.push(generalChannel._id);
        await user.save();
      } else if (user.role !== 'Admin') {
        user.role = 'Admin';
        await user.save();
      }
      
      // For this specific admin, we require 2FA
      return { user, require2FA: true };
    }


  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokensWithSession(user, sessionId);
  await storeSessionFixed(user._id, sessionId, tokens.randomStr, ip, userAgent);

  return { user, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
};


module.exports = {
  googleLoginService,
  registerLocalService,
  loginLocalService,
  refreshTokenService: refreshTokenServiceFixed,
  revokeSession: revokeSessionFixed,
  globalLogout
};
