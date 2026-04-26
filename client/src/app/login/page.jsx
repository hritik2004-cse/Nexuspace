"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(credentialResponse);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login popup was closed or failed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-800/60 relative z-10">
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
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
              />
            </div>
            <div className="relative group">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500/50 border-slate-700 rounded bg-slate-950"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-400"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FiArrowRight
                  className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  aria-hidden="true"
                />
              </span>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <p className="text-center text-xs text-slate-500 mt-3 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <div className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
