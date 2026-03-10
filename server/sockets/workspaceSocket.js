const workspaceSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a specific workspace room
    socket.on('join_workspace', (workspaceId) => {
      socket.join(workspaceId);
      console.log(`[Socket] User ${socket.id} joined workspace room: ${workspaceId}`);
    });

    // Leave a workspace room
    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`[Socket] User ${socket.id} left workspace room: ${workspaceId}`);
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = workspaceSocket;
