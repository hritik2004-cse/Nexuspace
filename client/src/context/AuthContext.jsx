"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/services/endpoints";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validate session against backend on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        setUser(userData);
        localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Session validation failed:", err.message);
        }
        setUser(null);
        localStorage.removeItem("nexuspace_user");
        localStorage.removeItem("nexuspace_token");
        // Destroy legacy cookies and proxy tokens
        document.cookie = "nexuspace_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Explicitly redirect if on a protected route
        if (window.location.pathname.startsWith('/workspace')) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post(API_ENDPOINTS.auth.login, { email, password });
      const { tokens, ...userData } = res.data;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", tokens.accessToken);
      setUser(userData);

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
      const { tokens, ...userData } = res.data;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", tokens.accessToken);
      setUser(userData);

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

      const res = await api.post(API_ENDPOINTS.auth.google, {
        credential: credentialResponse.credential,
      });

      const { tokens, ...userData } = res.data;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      localStorage.setItem("nexuspace_token", tokens.accessToken);
      setUser(userData);

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

  const updateProfile = async (updates) => {
    if (user) {
      try {
        const res = await api.put('/auth/profile', updates);
        const updatedUser = res.data;
        setUser(updatedUser);
        localStorage.setItem("nexuspace_user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully!");
      } catch (err) {
        toast.error("Profile update failed. Reverting changes.");
        const fallbackUser = { ...user, ...updates };
        setUser(fallbackUser);
        localStorage.setItem("nexuspace_user", JSON.stringify(fallbackUser));
      }
    }
  };

  const joinChannel = (channelName) => {
    if (user) {
      const currentChannels = user.channels || ["general"];
      if (!currentChannels.includes(channelName)) {
        const updatedChannels = [...currentChannels, channelName];
        updateProfile({ channels: updatedChannels });
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) {
      console.error("Logout failed silently", err);
    }
    
    setUser(null);
    localStorage.removeItem("nexuspace_user");
    localStorage.removeItem("nexuspace_token");
    document.cookie = "csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
      {/* 
        Optional: We can render a full-page loading spinner here if `loading` is true.
        For now, we let children render, and protected routes can use `loading`.
      */}
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-zinc-400">Authenticating Secure Session...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
