const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const workspaceService = require('./workspaceService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helpers
 */

const extractSessionId = (token) => {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null; // sessionId.jti.random
  return parts[0];
};

const generateTokensWithSession = (user, sessionId) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const payload = {
    id: user._id,
    sessionVersion: user.sessionVersion || 0,
    sessionId,
    jti
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const randomStr = crypto.randomBytes(32).toString('hex');
  const refreshToken = `${sessionId}.${jti}.${randomStr}`;
  return { accessToken, refreshToken, jti, randomStr };
};

const storeSessionFixed = async (userId, sessionId, jti, randomStr, ip, userAgent) => {
  const currentTokenHash = Session.hashToken(randomStr);
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days

  await Session.findOneAndUpdate(
    { sessionId },
    {
      userId,
      sessionId,
      jti,
      currentTokenHash,
      ip,
      userAgent,
      expiresAt,
      revokedAt: null
    },
    { upsert: true, new: true }
  );
};

// Grace window cache: key(sessionId + fingerprint) -> { oldJti, lastTokens, expires }
// Capped at 1000 entries to prevent unbounded memory growth (V8 fix)
const GRACE_CACHE_MAX_SIZE = 1000;
const refreshGraceCache = new Map();

const graceSet = (key, value) => {
  if (refreshGraceCache.size >= GRACE_CACHE_MAX_SIZE) {
    // Evict the oldest entry (first inserted)
    const firstKey = refreshGraceCache.keys().next().value;
    refreshGraceCache.delete(firstKey);
  }
  refreshGraceCache.set(key, value);
};

const generateUniqueUsername = async (baseName) => {
  let username = baseName.toLowerCase().replace(/\s+/g, '_');
  let exists = await User.findOne({ username });
  if (!exists) return username;

  const MAX_RETRIES = 10;
  let attempts = 0;
  while (exists && attempts < MAX_RETRIES) {
    const suffix = Math.random().toString(36).substring(2, 6);
    username = `${baseName.toLowerCase().replace(/\s+/g, '_')}_${suffix}`;
    exists = await User.findOne({ username });
    attempts++;
  }
  if (exists) {
    // Fallback: use timestamp-based suffix for guaranteed uniqueness
    username = `${baseName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }
  return username;
};

/**
 * Services
 */

const refreshTokenServiceFixed = async (token, ip, userAgent) => {
  const sessionId = extractSessionId(token);
  if (!sessionId) throw new Error("Invalid token format");

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error("Invalid token structure");
  const [_, jti, randomStr] = parts;
  
  const fingerprint = crypto.createHash('sha256').update(`${ip}${userAgent}`).digest('hex');
  const graceKey = `${sessionId}:${fingerprint}`;

  const session = await Session.findOne({ sessionId, expiresAt: { $gt: new Date() } });

  // 1. Check if session is explicitly revoked
  if (session && session.revokedAt) {
    throw new Error("Session revoked due to security breach");
  }

  if (!session) {
    // 2. Check for race condition in grace window
    const graceData = refreshGraceCache.get(graceKey);
    if (graceData && Date.now() < graceData.expires && graceData.oldJti === jti) {
      const user = await User.findById(graceData.userId);
      if (!user) throw new Error("User not found");
      return { user, tokens: graceData.lastTokens, sessionId };
    }
    throw new Error("Session expired or invalid");
  }

  // 3. Token Reuse Detection
  const isCurrentJti = session.jti === jti;
  const isValidHash = await Session.verifyToken(randomStr, session.currentTokenHash);

  if (!isCurrentJti || !isValidHash) {
    // SECURITY BREACH: Token reuse detected. 
    session.revokedAt = new Date();
    await session.save();
    console.error(`[AUTH BREACH] Refresh token reuse detected. Session: ${sessionId}, IP: ${ip}`);
    throw new Error("Security alert: Session terminated due to suspicious activity");
  }

  // 4. Valid! Rotate.
  const user = await User.findById(session.userId);
  if (!user || user.sessionVersion > (jwt.decode(token)?.sessionVersion || 0)) {
     throw new Error("Session version mismatch. Please login again.");
  }

  const tokens = generateTokensWithSession(user, sessionId);
  const finalTokens = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };

  // Store in grace cache for 10s
  graceSet(graceKey, { 
    oldJti: jti, 
    userId: user._id,
    lastTokens: finalTokens,
    expires: Date.now() + 10000 
  });
  
  setTimeout(() => refreshGraceCache.delete(graceKey), 12000);

  await storeSessionFixed(user._id, sessionId, tokens.jti, tokens.randomStr, ip, userAgent);

  return { user, tokens: finalTokens, sessionId };
};

const revokeSessionFixed = async (token) => {
  const sessionId = extractSessionId(token);
  if (sessionId) {
    await Session.findOneAndDelete({ sessionId });
  }
};

const globalLogout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { sessionVersion: 1 } });
  await Session.deleteMany({ userId });
};

const googleLoginService = async (credential, sessionId, ip, userAgent) => {
  let sub, email, name, picture;

  try {
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
    // Do NOT fall back to using credential as a Bearer token —
    // that would allow any Google access token (or stolen token) to authenticate.
    console.error('[Google Auth] ID token verification failed:', err.message);
    throw new Error('Failed to verify Google credential. Please sign in again.');
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
  await storeSessionFixed(user._id, sessionId, tokens.jti, tokens.randomStr, ip, userAgent);

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
  await storeSessionFixed(newUser._id, sessionId, tokens.jti, tokens.randomStr, ip, userAgent);

  return { user: newUser, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
};

const loginLocalService = async ({ email, password, sessionId, ip, userAgent }) => {
  // V3 fix: Use timingSafeEqual to prevent timing side-channel attacks on admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const emailMatch = email.toLowerCase() === adminEmail.toLowerCase();
  let passwordMatch = false;
  try {
    passwordMatch = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(adminPassword)
    );
  } catch {
    passwordMatch = false; // Buffer length mismatch means no match
  }
  const isAdminCredentials = emailMatch && passwordMatch;

  
  let user = await User.findOne({ email });

  if (isAdminCredentials) {
    if (!user) {
      const username = await generateUniqueUsername('Global Admin');
      user = await User.create({
        name: 'Global Admin',
        email,
        password,
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
    
    return { user, require2FA: true };
  }

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokensWithSession(user, sessionId);
  await storeSessionFixed(user._id, sessionId, tokens.jti, tokens.randomStr, ip, userAgent);

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
