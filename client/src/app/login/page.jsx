"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // 2FA State
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("nexuspace_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(credentialResponse);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleFlow = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setError("We couldn't connect to Google. Please try again or use your email.");
      toast.error("We couldn't connect to Google. Please try again or use your email.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (rememberMe) {
      localStorage.setItem("nexuspace_remember_email", email);
    } else {
      localStorage.removeItem("nexuspace_remember_email");
    }

    try {
      const res = await login(email, password);
      if (res?.require2FA) {
        setIs2FAOpen(true);
        toast.info(res.message || "Please enter your security code to continue.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      const res = await api.post("/auth/verify-admin-2fa", { email, pin: twoFactorCode });
      
      // Verification successful, context login will take care of redirect
      // But since we are calling api directly here, we need to sync the AuthContext
      // Actually, AuthContext.login already does this if we use it.
      // Let's just use window.location.reload() or let the app redirect.
      toast.success("Identity verified! Welcome back, Admin.");
      setTimeout(() => window.location.href = "/workspace", 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "That code doesn't look right. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success("If that email is in our system, we've sent you a reset code!");
      setResendTimer(60);
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post("/auth/reset-password", { email: forgotEmail, code: forgotCode, newPassword });
      toast.success("Success! Your password has been updated.");
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };
  const strength = getPasswordStrength(newPassword);

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Animated Background Framer Motion */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-800/60 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 tracking-tight">
            Nexuspace
          </h2>
          <p className="mt-4 text-center text-sm text-slate-400">
            Sign in to access your workspaces.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative group">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5 z-10" />
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!error}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
              />
            </div>
            <div className="relative group">
              <label htmlFor="password" className="sr-only">Password</label>
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5 z-10" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={!!error}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors z-10 cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500/50 border-slate-700 rounded bg-slate-950 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>


          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && (
                <FiArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full">
              {/* Using official GoogleLogin component to resolve COOP/POPUP issues in production */}
              <div className="w-full flex justify-center [&>div]:!w-full [&>div>div]:!w-full [&>div>div>iframe]:!w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError("Google Login failed. Please try again.");
                    toast.error("Google Login failed.");
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                  useOneTap
                />
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-3 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.
          </p>
        </form>

        <div className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Create an account
          </Link>
        </div>
      </div>

      {/* Admin 2FA Modal */}
      <AnimatePresence>
        {is2FAOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-10 max-w-md w-full shadow-[0_0_50px_rgba(79,70,229,0.2)] relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-purple-500"></div>
              
              <button 
                onClick={() => setIs2FAOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >✕</button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <FiLock className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white tracking-tight">Admin Security</h3>
                  <p className="text-slate-400 text-sm font-medium">A 6-digit PIN has been sent to your security email. Please enter it to unlock administrative access.</p>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-8">
                  <input 
                    type="text" 
                    required 
                    maxLength={6} 
                    value={twoFactorCode} 
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} 
                    placeholder="000000" 
                    className="w-full px-6 py-5 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center text-4xl tracking-[0.4em] font-black placeholder:opacity-20" 
                    autoFocus
                  />
                  
                  <button 
                    type="submit" 
                    disabled={twoFactorLoading || twoFactorCode.length < 6} 
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:grayscale transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {twoFactorLoading ? "Verifying..." : "Unlock Access"}
                  </button>

                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High Security Session</p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => { setForgotOpen(false); setForgotStep(1); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
              >✕</button>

              {forgotStep === 1 && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">Reset Password</h3>
                  <p className="text-slate-400 text-sm">Enter your email and we'll send you a 6-digit reset code.</p>
                  
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  
                  <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    {forgotLoading ? "Sending..." : "Send Code"}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <h3 className="text-2xl font-bold text-white">Enter Code</h3>
                  <p className="text-slate-400 text-sm">We sent a code to {forgotEmail}</p>

                  <input type="text" required maxLength={6} value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-mono" />
                  
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  {newPassword && (
                    <div className="flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div className={`h-full transition-all ${strength > 0 ? 'bg-rose-500 w-1/4' : 'w-0'} ${strength >= 50 && 'bg-amber-500 w-2/4'} ${strength >= 75 && 'bg-emerald-400 w-3/4'} ${strength === 100 && 'bg-emerald-500 w-full'}`}></div>
                    </div>
                  )}

                  <button type="submit" disabled={forgotLoading || newPassword.length < 8 || forgotCode.length < 6} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>

                  <div className="text-center">
                    <button type="button" disabled={resendTimer > 0} onClick={handleForgotPassword} className="text-sm text-slate-400 hover:text-white disabled:opacity-50 transition-colors">
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive a code? Resend"}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <FiCheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Password Reset!</h3>
                  <p className="text-slate-400">Your password has been successfully updated. You can now sign in with your new password.</p>
                  <button onClick={() => { setForgotOpen(false); setForgotStep(1); }} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors">
                    Back to Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
