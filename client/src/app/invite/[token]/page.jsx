"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiClock, FiUsers, FiXCircle, FiArrowRight, FiShield } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function InvitationPage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  
  // Countdown State
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetDate, setTargetDate] = useState(null);
  const [lastSync, setLastSync] = useState(0);

  const fetchInvitation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/invite/${token}`);
      const invite = res.data.invitation;
      setInvitation(invite);
      
      const expires = new Date(invite.expiresAt).getTime();
      setTargetDate(expires);
      setTimeLeft(Math.max(0, Math.ceil((expires - Date.now()) / 1000)));
      setLastSync(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || 'This invitation is no longer valid.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // God Mode Countdown with Visibility Re-sync
  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && targetDate) {
        const now = Date.now();
        // Guard: throttle re-sync to 30s
        if (now - lastSync > 30000) {
          setTimeLeft(Math.max(0, Math.ceil((targetDate - now) / 1000)));
          setLastSync(now);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeLeft, targetDate, lastSync]);

  const handleAccept = async () => {
    if (!user) {
      toast.info('Please sign in to accept this invitation.');
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    try {
      setAccepting(true);
      const res = await api.post(`/workspaces/invite/${token}/accept`);
      toast.success('Welcome to the workspace!');
      router.push(`/workspace?workspace=${res.data.workspaceId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-zinc-500 font-bold uppercase tracking-widest text-xs">Verifying Access Scope...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <FiXCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Access Denied</h1>
        <p className="text-zinc-400 max-w-sm mb-8">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/10"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
            <FiShield size={40} />
          </div>
          
          <div className="space-y-2 mb-8">
            <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Workspace Invitation</p>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Join <span className="text-primary">{invitation.workspaceId.name}</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              <span className="font-bold text-zinc-200">{invitation.inviterId.name}</span> has invited you to collaborate in their workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <FiClock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Expires In</span>
              </div>
              <p className="text-white font-bold text-sm tabular-nums">
                {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <FiUsers size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Visibility</span>
              </div>
              <p className="text-white font-bold text-sm">Members Only</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={handleAccept}
              disabled={accepting || timeLeft === 0}
              className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:grayscale"
            >
              {accepting ? 'Joining...' : (user ? 'Accept & Join Workspace' : 'Sign in to Join')}
              <FiArrowRight />
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-4 text-zinc-500 font-bold text-sm hover:text-white transition-colors"
            >
              Decline Invitation
            </button>
          </div>
        </div>
      </motion.div>

      <footer className="mt-12 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
        Nexuspace Secure Ingress
      </footer>
    </main>
  );
}
