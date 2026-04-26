import { io } from "socket.io-client";

// In a real app, this URL should come from an environment variable (e.g., process.env.NEXT_PUBLIC_API_URL)
const DEFAULT_SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://nexuspace-backend.onrender.com"
    : "http://localhost:5000";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL;

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
