const bcrypt = require('bcrypt');
const Channel = require('../models/Channel');
const AuditLog = require('../models/AuditLog');
const Workspace = require('../models/Workspace');
const redis = require('../config/redis');

// Constants
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 300; // 5 minutes in seconds
const SESSION_TIME = 1800; // 30 minutes in seconds

const verifyPin = async (req, res) => {
  try {
    const { id: channelId } = req.params;
    const { pin } = req.body;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel || !channel.isPrivate) {
      return res.status(400).json({ message: 'Channel is not private or not found.' });
    }

    // Check Redis for active lock
    const lockKey = `channel_lock:${channelId}:${userId}`;
    const isLocked = await redis.get(lockKey);
    if (isLocked) {
      await AuditLog.create({ action: 'CHANNEL_LOCKED', userId, channelId, metadata: { reason: 'Active lock' } });
      return res.status(429).json({ message: 'Too many attempts. Locked out.' });
    }

    // Validate PIN
    const isValid = await bcrypt.compare(pin, channel.pinHash);
    const attemptsKey = `pin_attempts:${channelId}:${userId}`;

    if (!isValid) {
      let attempts = await redis.incr(attemptsKey);
      if (attempts === 1) await redis.expire(attemptsKey, 300); // 5 min rolling window

      await AuditLog.create({ action: 'PIN_FAILED', userId, channelId, metadata: { attempts } });

      if (attempts >= MAX_ATTEMPTS) {
        await redis.setex(lockKey, LOCK_TIME, 'locked');
        await redis.del(attemptsKey);
        await AuditLog.create({ action: 'CHANNEL_LOCKED', userId, channelId, metadata: { reason: 'Max attempts reached' } });
        return res.status(429).json({ message: 'Too many attempts. Locked for 5 minutes.' });
      }
      return res.status(401).json({ message: `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempts remaining.` });
    }

    // Success - Issue 30-minute Redis session
    await redis.del(attemptsKey);
    await redis.setex(`channel_access:${channelId}:${userId}`, SESSION_TIME, 'true');
    await AuditLog.create({ action: 'PIN_VERIFIED', userId, channelId });

    res.status(200).json({ message: 'Access granted.', expires_in: SESSION_TIME });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePin = async (req, res) => {
  try {
    const { id: channelId } = req.params;
    const { newPin } = req.body;
    
    // Auth logic: Only Admin can change PIN. Handled by middleware? Let's check workspace owner too.
    const channel = await Channel.findById(channelId);
    const workspace = await Workspace.findById(channel.workspaceId);
    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const pinHash = await bcrypt.hash(newPin, 10);
    channel.pinHash = pinHash;
    channel.pinUpdatedAt = Date.now();
    await channel.save();

    await AuditLog.create({ action: 'PIN_CHANGED', userId: req.user._id, channelId });

    // Revoke all existing sessions
    await revokeAllSessions(channelId);
    
    // Issue session for the admin who just changed it
    await redis.setex(`channel_access:${channelId}:${req.user._id}`, SESSION_TIME, 'true');

    // Emit socket event to eject unauthorized users (implementation depends on socket setup)
    if (req.io) {
      req.io.to(channelId.toString()).emit('session_expired', { reason: 'PIN was changed by an admin' });
    }

    res.status(200).json({ message: 'PIN updated and all sessions revoked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const revokeSessions = async (req, res) => {
  try {
    const { id: channelId } = req.params;
    await revokeAllSessions(channelId);
    await AuditLog.create({ action: 'SESSIONS_REVOKED', userId: req.user._id, channelId });

    if (req.io) {
      req.io.to(channelId.toString()).emit('session_expired', { reason: 'Sessions revoked by admin' });
    }

    res.status(200).json({ message: 'All sessions successfully revoked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper
const revokeAllSessions = async (channelId) => {
  // Using ioredis keys or scan
  const keys = await redis.keys(`channel_access:${channelId}:*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
};

module.exports = { verifyPin, changePin, revokeSessions };
