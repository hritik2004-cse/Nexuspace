const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected to Socket.io hub: ${socket.id}`);

    // Join a specific channel room
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    // Leave a channel room
    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      console.log(`Socket ${socket.id} left channel ${channelId}`);
    });

    // Handle incoming chat messages
    socket.on('send_message', (data) => {
      // Broadcast to everyone in the channel EXCEPT the sender
      socket.to(data.channelId).emit('receive_message', data);
    });

    // Handle reaction updates
    socket.on('update_reaction', (data) => {
      socket.to(data.channelId).emit('reaction_updated', data);
    });
    
    // Handle message pinning
    socket.on('pin_message', (data) => {
      socket.to(data.channelId).emit('message_pinned', data);
    });

    // Handle task board updates (drag and drop sync)
    socket.on('board_update', (data) => {
      socket.to(data.workspaceId).emit('receive_board_update', data);
    });

    // Presence / Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected from Socket.io hub: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
