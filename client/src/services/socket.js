import { io } from "socket.io-client";

// In a real app, this URL should come from an environment variable (e.g., process.env.NEXT_PUBLIC_API_URL)
const DEFAULT_SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://nexuspace-backend.onrender.com"
    : "http://localhost:5000";

const getSocketUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!envUrl) return DEFAULT_SOCKET_URL;

  if (process.env.NODE_ENV === "production" && envUrl.includes("localhost")) {
    return DEFAULT_SOCKET_URL;
  }

  return envUrl;
};

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Wait until user is authenticated/workspace is loaded
  withCredentials: true,
  auth: (cb) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("nexuspace_token") : null;
    cb({ token });
  }
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
