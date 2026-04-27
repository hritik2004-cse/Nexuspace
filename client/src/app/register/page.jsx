"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-800/60 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-400 tracking-tight">
            Join Nexuspace
          </h2>
          <p className="mt-4 text-center text-sm text-slate-400">
            Create an account to collaborate with your team.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative group">
              <label htmlFor="name" className="sr-only">Full name</label>
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 sm:text-sm transition-all"
                placeholder="Full name"
              />
            </div>
            <div className="relative group">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 sm:text-sm transition-all"
                placeholder="Email address"
              />
            </div>
            <div className="relative group">
              <label htmlFor="password" className="sr-only">Password</label>
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 bg-slate-950/50 border border-slate-700/50 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 sm:text-sm transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FiArrowRight className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" aria-hidden="true" />
              </span>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
