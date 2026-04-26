const workspaceSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a specific workspace room
    socket.on('join_workspace', (workspaceId) => {
      socket.join(workspaceId);
      console.log(`[Socket] User ${socket.id} joined workspace room: ${workspaceId}`);
    });

    // Channel Room isolating (CRITICAL for Chat)
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
    });

    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
    });

    socket.on('typing', ({ channelId, username }) => {
      socket.to(channelId).emit('display_typing', username);
    });

    socket.on('stop_typing', ({ channelId }) => {
      socket.to(channelId).emit('hide_typing');
    });

    // Real-Time Notification mapping (Direct to user IDs)
    socket.on('send_notification', ({ targetUserId, message }) => {
      // Assuming users join a room matching their own userId upon connection in AuthContext
      socket.to(targetUserId).emit('receive_notification', message);
    });

    // Join Personal Room mapping for Mention routing
    socket.on('register_user', (userId) => {
      socket.join(userId);
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = workspaceSocket;
