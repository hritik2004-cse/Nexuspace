const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorMiddleware');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const generateRequestId = (req, res, next) => {
  req.requestId = uuidv4();
  next();
};

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no access token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check session version
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    if (req.user.sessionVersion !== decoded.sessionVersion) {
      res.status(401);
      throw new Error('Session revoked globally');
    }

    req.sessionId = decoded.sessionId;

    next();
  } catch (error) {
    console.error(`[RequestId: ${req.requestId}] JWT Error:`, error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

const { hasPermission } = require('../config/permissions');

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(401);
      throw new Error('Not authorized, role missing');
    }

    if (hasPermission(req.user.role, requiredPermission)) {
      next();
    } else {
      res.status(403);
      throw new Error(`Permission Denied: Requires ${requiredPermission}`);
    }
  };
};

const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const Message = require('../models/Message');
const redis = require('../config/redis');

// Verify access to private channels
const verifyChannelAccess = asyncHandler(async (req, res, next) => {
  let channelId = req.params.channelId || req.body.channelId;
  
  if (!channelId && req.params.id) {
    if (req.originalUrl.includes('/messages/')) {
       const message = await Message.findById(req.params.id);
       if (!message) {
         res.status(404);
         throw new Error('Message not found');
       }
       channelId = message.channelId;
    } else {
       channelId = req.params.id;
    }
  }

  if (!channelId) {
    return next(); // Skip if no channelId in route
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    res.status(404);
    throw new Error('Channel not found');
  }

  if (!channel.isPrivate) return next();
  if (req.user.role === 'Admin') return next();

  const workspace = await Workspace.findById(channel.workspaceId);
  if (workspace && workspace.owner.toString() === req.user._id.toString()) return next();

  const accessKey = `channel_access:${channelId}:${req.user._id}`;
  const hasAccess = await redis.get(accessKey);

  if (hasAccess) return next();

  res.status(403);
  throw new Error('Access denied. Please enter the PIN.');
});

module.exports = { protect, checkPermission, verifyChannelAccess, generateRequestId };
