"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '@/services/socket';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      console.log("[Socket] Connected successfully");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("[Socket] Disconnected");
      setIsConnected(false);
    };
    const onError = (err) => {
      console.error("[Socket] Connection Error:", err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
