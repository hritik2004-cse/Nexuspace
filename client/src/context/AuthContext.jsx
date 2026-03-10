"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock checking local storage for a session
  useEffect(() => {
    const storedUser = localStorage.getItem('nexuspace_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const username = email.split('@')[0];
          const mockUser = { id: 1, name: username, username, email, channels: ['general'], isOnline: true };
          setUser(mockUser);
          localStorage.setItem('nexuspace_user', JSON.stringify(mockUser));
          resolve(mockUser);
          router.push('/workspace');
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const register = async (name, email, password) => {
    // Mock API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const username = name.toLowerCase().replace(/\s+/g, '');
          const mockUser = { id: Date.now(), name, username, email, channels: ['general'], isOnline: true };
          setUser(mockUser);
          localStorage.setItem('nexuspace_user', JSON.stringify(mockUser));
          resolve(mockUser);
          router.push('/workspace');
        } else {
          reject(new Error('Invalid details'));
        }
      }, 500);
    });
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("No Google token received");
      }

      // Hit our new Node Express backend Auth endpoint
      const res = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential, // the encoded ID token
      });

      // Backend returns the populated user + JWT
      const { token, ...userData } = res.data;

      setUser(userData);
      localStorage.setItem('nexuspace_user', JSON.stringify(userData));
      localStorage.setItem('nexuspace_token', token);
      
      router.push('/workspace');
      return userData;
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new Error(error.response?.data?.message || 'Authentication with Nexuspace Server failed');
    }
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('nexuspace_user', JSON.stringify(updatedUser));
    }
  };

  const joinChannel = (channelName) => {
    if (user) {
      // Prevent duplicates
      const currentChannels = user.channels || ['general'];
      if (!currentChannels.includes(channelName)) {
        const updatedChannels = [...currentChannels, channelName];
        updateProfile({ channels: updatedChannels });
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexuspace_user');
    localStorage.removeItem('nexuspace_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateProfile, joinChannel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
