const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const redis = require('../config/redis');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

// Memory Safe Maps
const userSockets = new Map(); // userId -> Set<socketId>
const sessionSockets = new Map(); // sessionId -> Set<socketId>
const socketIdToUserSession = new Map(); // socketId -> { userId, sessionId }

const getSocketSets = (map, key) => {
  if (!map.has(key)) map.set(key, new Set());
  return map.get(key);
};

const workspaceSocket = (io) => {

  // Middleware: Manual Cookie Auth
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.access_token;
      
      if (!token) return next(new Error('Authentication error: No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication error: User not found'));
      
      if (user.sessionVersion !== decoded.sessionVersion) {
        return next(new Error('Authentication error: Session revoked globally'));
      }

      socket.user = user;
      socket.sessionId = decoded.sessionId;
      socket.requestId = socket.handshake.query.requestId || 'socket-req';
      
      next();
    } catch (err) {
      console.error(`[Socket Auth Error]`, err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { user, sessionId, id: socketId } = socket;
    const userIdStr = user._id.toString();

    // Map bindings
    getSocketSets(userSockets, userIdStr).add(socketId);
    getSocketSets(sessionSockets, sessionId).add(socketId);
    socketIdToUserSession.set(socketId, { userId: userIdStr, sessionId });

    socket.join(userIdStr); // Personal room for notifications

    socket.on('join_workspace', (workspaceId) => {
      socket.join(workspaceId);
    });

    socket.on('join_channel', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) return socket.emit('channel_error', { message: 'Channel not found' });

        if (channel.isPrivate) {
          const workspace = await Workspace.findById(channel.workspaceId);
          const hasAccess = await redis.get(`channel_access:${channelId}:${userIdStr}`);
          
          if (!hasAccess && user.role !== 'Admin' && (!workspace || workspace.owner.toString() !== userIdStr)) {
             return socket.emit('session_expired', { reason: 'Unauthorized or PIN required.' });
          }
        }
        socket.join(channelId);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
    });

    socket.on('disconnect', () => {
      const mapping = socketIdToUserSession.get(socketId);
      if (mapping) {
        const { userId, sessionId: sId } = mapping;
        
        const userSet = userSockets.get(userId);
        if (userSet) {
          userSet.delete(socketId);
          if (userSet.size === 0) userSockets.delete(userId);
        }

        const sessionSet = sessionSockets.get(sId);
        if (sessionSet) {
          sessionSet.delete(socketId);
          if (sessionSet.size === 0) sessionSockets.delete(sId);
        }
        
        socketIdToUserSession.delete(socketId);
      }
    });
  });

  // Attach eviction helpers to `io` for controllers to use
  io.evictSession = (sessionId) => {
    const sockets = sessionSockets.get(sessionId);
    if (sockets) {
      sockets.forEach(socketId => {
        const target = io.sockets.sockets.get(socketId);
        if (target) {
          target.emit('session_expired', { reason: 'Session revoked.' });
          target.disconnect(true);
        }
      });
    }
  };

  io.evictUserFromChannel = (userId, channelId) => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        const target = io.sockets.sockets.get(socketId);
        if (target) {
          target.leave(channelId);
          target.emit('channel_error', { message: 'You have been removed from this channel.' });
        }
      });
    }
  };
};

module.exports = workspaceSocket;
