"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiAlertCircle } from 'react-icons/fi';
import api from '@/services/api';

export default function PinModal({ isOpen, channelId, channelName, onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post(`/channels/${channelId}/verify-pin`, { pin });
      setPin('');
      onSuccess(res.data.expires_in);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.message || 'Locked out. Please try again later.');
      } else if (err.response?.status === 401) {
        setError(err.response.data.message || 'Incorrect PIN.');
      } else {
        setError('Error verifying PIN.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030014]/80 backdrop-blur-md">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex flex-col bg-[#0a0a0f]/90 border border-white/10 rounded-3xl shadow-[0_0_80px_-20px_rgba(245,158,11,0.2)] w-full max-w-sm overflow-hidden backdrop-blur-2xl p-8"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[60px] pointer-events-none"></div>

        <div className="flex flex-col items-center text-center relative z-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <FiLock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Private Channel</h2>
            <p className="text-slate-400 text-sm mt-2">Enter the PIN to access <span className="font-bold text-amber-400">#{channelName}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-2">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              disabled={isLoading}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans tracking-[0.5em] text-center text-2xl shadow-inner disabled:opacity-50"
              placeholder="••••"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2.5 px-4 rounded-xl flex items-start gap-2">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!pin || isLoading}
              className="flex-1 py-3 text-sm font-bold bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 hover:scale-105"
            >
              {isLoading ? 'Verifying...' : 'Unlock'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
