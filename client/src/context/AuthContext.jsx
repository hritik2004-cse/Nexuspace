"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/services/endpoints";

const AuthContext = createContext();

const isLikelyJwt = (token) =>
  typeof token === "string" && token.split(".").length === 3;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock checking local storage for a session
  useEffect(() => {
    const storedUser = localStorage.getItem("nexuspace_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post(API_ENDPOINTS.auth.login, { email, password });
      const { token, ...userData } = res.data;

      if (!isLikelyJwt(token)) {
        throw new Error(res.data?.message || "Login failed. Please try again.");
      }

      localStorage.removeItem("nexuspace_user");
      localStorage.removeItem("nexuspace_token");
      setUser(userData);
      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", token);
      document.cookie = `nexuspace_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;

      router.push("/workspace");
      return userData;
    } catch (error) {
      console.error("Login Error:", error);
      throw new Error(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post(API_ENDPOINTS.auth.register, { name, email, password });
      const { token, ...userData } = res.data;

      if (!isLikelyJwt(token)) {
        throw new Error(res.data?.message || "Registration failed. Please try again.");
      }

      localStorage.removeItem("nexuspace_user");
      localStorage.removeItem("nexuspace_token");
      setUser(userData);
      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", token);
      document.cookie = `nexuspace_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;

      router.push("/workspace");
      return userData;
    } catch (error) {
      console.error("Registration Error:", error);
      throw new Error(
        error.response?.data?.message || "Registration failed. Please check your details."
      );
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("No Google token received");
      }

      // Hit our new Node Express backend Auth endpoint using the centralized API service
      const res = await api.post(API_ENDPOINTS.auth.google, {
        credential: credentialResponse.credential, // the encoded ID token
      });

      // Backend returns the populated user + JWT
      const { token, ...userData } = res.data;

      if (!isLikelyJwt(token)) {
        throw new Error(
          res.data?.message || "Google login failed. Please try again.",
        );
      }

      localStorage.removeItem("nexuspace_user");
      localStorage.removeItem("nexuspace_token");
      setUser(userData);
      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", token);
      document.cookie = `nexuspace_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;

      router.replace("/workspace");
      return userData;
    } catch (error) {
      console.error("Google Auth Error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Authentication with Nexuspace Server failed",
      );
    }
  };

  const updateProfile = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("nexuspace_user", JSON.stringify(updatedUser));
    }
  };

  const joinChannel = (channelName) => {
    if (user) {
      // Prevent duplicates
      const currentChannels = user.channels || ["general"];
      if (!currentChannels.includes(channelName)) {
        const updatedChannels = [...currentChannels, channelName];
        updateProfile({ channels: updatedChannels });
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nexuspace_user");
    localStorage.removeItem("nexuspace_token");
    document.cookie = "nexuspace_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        joinChannel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
