import { io } from 'socket.io-client';

// In a real app, this URL should come from an environment variable (e.g., process.env.NEXT_PUBLIC_API_URL)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Wait until user is authenticated/workspace is loaded
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
