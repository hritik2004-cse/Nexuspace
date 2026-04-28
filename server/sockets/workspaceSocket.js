const onlineUsers = new Map(); // userId -> Set(socketIds)

const workspaceSocket = (io) => {
  io.on('connection', (socket) => {
    const joinedWorkspaces = new Set();
    const joinedChannels = new Set();

    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on('authenticate', (userId) => {
      socket.userId = userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        io.emit('userOnline', userId); // Only emit on first login
      }
      onlineUsers.get(userId).add(socket.id);
      console.log(`[Socket] User ${userId} authenticated`);
    });

    socket.on('joinWorkspace', (workspaceId) => {
      socket.join(workspaceId);
      joinedWorkspaces.add(workspaceId);
      if (socket.userId) {
        io.to(workspaceId).emit('presenceUpdate', { userId: socket.userId, status: 'online' });
      }
    });

    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(workspaceId);
      joinedWorkspaces.delete(workspaceId);
      if (socket.userId) {
        io.to(workspaceId).emit('presenceUpdate', { userId: socket.userId, status: 'offline' });
      }
    });

    socket.on('joinChannel', (channelId) => {
      socket.join(channelId);
      joinedChannels.add(channelId);
    });

    socket.on('leaveChannel', (channelId) => {
      socket.leave(channelId);
      joinedChannels.delete(channelId);
    });

    socket.on('sendMessage', (data) => {
      if (joinedChannels.has(data.channelId)) {
        io.to(data.channelId).emit('receiveMessage', data);
      }
    });

    socket.on('typing', (data) => {
      if (joinedChannels.has(data.channelId)) {
        socket.to(data.channelId).emit('typing', data);
      }
    });

    socket.on('stopTyping', (data) => {
      if (joinedChannels.has(data.channelId)) {
        socket.to(data.channelId).emit('stopTyping', data);
      }
    });

    socket.on('messageReaction', (data) => {
      if (joinedChannels.has(data.channelId)) {
        io.to(data.channelId).emit('messageReaction', data);
      }
    });

    socket.on('messagePinned', (data) => {
      if (joinedChannels.has(data.channelId)) {
        io.to(data.channelId).emit('messagePinned', data);
      }
    });

    socket.on('taskUpdated', (data) => {
      if (joinedWorkspaces.has(data.workspaceId)) {
        io.to(data.workspaceId).emit('taskUpdated', data);
      }
    });

    socket.on('notification', (data) => {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(socketId => {
          io.to(socketId).emit('notification', data.notification);
        });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit('userOffline', socket.userId);
          
          joinedWorkspaces.forEach(workspaceId => {
            io.to(workspaceId).emit('presenceUpdate', { userId: socket.userId, status: 'offline' });
          });
        }
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { workspaceSocket, getOnlineUsers };
