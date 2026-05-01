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
      // 1. Silent Check: If no session cookie exists, don't even try to fetch.
      // This prevents the "red" 401 error in the browser console for guest users.
      const hasSession = document.cookie.split(';').some((item) => item.trim().startsWith('csrf_token='));
      
      if (!hasSession) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        setUser(userData);
        localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      } catch (err) {
        // Silently clear local state if unauthorized
        setUser(null);
        localStorage.removeItem("nexuspace_user");
        localStorage.removeItem("nexuspace_token");
        document.cookie = "nexuspace_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
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
      const data = res.data;
      const userData = data.tokens ? (({ tokens, ...rest }) => rest)(data) : data;
      const accessToken = data.tokens?.accessToken;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem("nexuspace_token", accessToken);
      }
      setUser(userData);

      router.push("/workspace");
      return userData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post(API_ENDPOINTS.auth.register, { name, email, password });
      const data = res.data;
      const userData = data.tokens ? (({ tokens, ...rest }) => rest)(data) : data;
      const accessToken = data.tokens?.accessToken;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem("nexuspace_token", accessToken);
      }
      setUser(userData);

      router.push("/workspace");
      return userData;
    } catch (error) {
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

      const data = res.data;
      const userData = data.tokens ? (({ tokens, ...rest }) => rest)(data) : data;
      const accessToken = data.tokens?.accessToken;

      localStorage.setItem("nexuspace_user", JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem("nexuspace_token", accessToken);
      }
      setUser(userData);

      toast.success("Welcome back! Syncing your workspace...");
      setTimeout(() => {
        window.location.href = "/workspace";
      }, 500);
      return userData;
    } catch (error) {
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
        toast.success("All set! Your profile has been updated.");
      } catch (err) {
        toast.error("We couldn't save your profile changes. Please try again in a moment.");
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
      console.error('Logout API failure:', err);
    }
    
    // Emit monotonic logout event for multi-tab sync
    const ts = Date.now();
    localStorage.setItem('logout_event', JSON.stringify({ ts }));
    localStorage.setItem('last_logout_ts', ts);
    
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
        sendPhoneOtp: async (phoneNumber) => {
          try {
            await api.post('/auth/send-phone-otp', { phoneNumber });
            toast.success("Verification code sent! Please check your phone.");
            return true;
          } catch (err) {
            toast.error(err.response?.data?.message || "We couldn't send the code. Please check the number and try again.");
            return false;
          }
        },
        verifyPhone: async (phoneNumber, otp) => {
          try {
            const res = await api.post('/auth/verify-phone-otp', { phoneNumber, otp });
            const updatedUser = { ...user, phoneNumber: res.data.phoneNumber, isPhoneVerified: true };
            setUser(updatedUser);
            localStorage.setItem("nexuspace_user", JSON.stringify(updatedUser));
            toast.success("Great! Your phone number is now verified.");
            return true;
          } catch (err) {
            toast.error(err.response?.data?.message || "That code doesn't look right. Please double-check and try again.");
            return false;
          }
        }
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
