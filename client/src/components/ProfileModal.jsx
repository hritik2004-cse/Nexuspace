"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiX, FiCheck, FiUser, FiMail, FiLock, FiUpload, FiEye, FiTag, FiPhone, FiHash } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ProfileModal({ isOpen, onClose, viewUser = null }) {
  const { user, logout, updateProfile } = useAuth();
  
  // If viewUser is provided, use their data, otherwise use the logged-in user's data
  const profileData = viewUser || user || {};
  const isReadOnly = !!viewUser;

  const [name, setName] = useState(profileData.name || '');
  const [username, setUsername] = useState(profileData.username || profileData.name?.toLowerCase() || '');
  const [bio, setBio] = useState(profileData.bio || '');
  const [customTitle, setCustomTitle] = useState(profileData.customTitle || 'Member');
  const [email, setEmail] = useState(profileData.email || '');
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber || '');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);
  const { sendPhoneOtp, verifyPhone } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex flex-col bg-surface border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(var(--primary-rgb),0.2)] w-full max-w-[440px] max-h-[90vh] overflow-hidden backdrop-blur-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Photo Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-primary/40 via-primary/20 to-transparent opacity-50 blur-2xl pointer-events-none"></div>
        <div className="relative h-32 w-full bg-linear-to-r from-primary/30 to-primary/10 border-b border-white/5 overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 z-20 text-white/50 lg:hover:text-white transition-colors p-2 rounded-full lg:hover:bg-white/10 backdrop-blur-md border border-white/10"
           >
             <FiX className="w-5 h-5" />
           </button>
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-8 pb-8 -mt-16 flex flex-col items-center">
          {/* Avatar Section */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-110 lg:group-hover:scale-125 transition-transform duration-700"></div>
            {(profileData.avatar || profileData.profileImage) ? (
              <img 
                src={profileData.avatar || profileData.profileImage} 
                className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl ring-8 ring-surface relative z-10 lg:group-hover:scale-105 transition-all duration-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-[2.5rem] bg-linear-to-tr from-primary via-primary/80 to-primary flex items-center justify-center text-white font-black text-5xl shadow-2xl ring-8 ring-surface relative z-10 lg:group-hover:scale-105 transition-all duration-500">
                {profileData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            
            {/* Online Indicator */}
            {profileData.isOnline && (
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-400 border-[6px] border-surface rounded-full z-20 shadow-[0_0_20px_rgba(52,211,153,0.4)]"></div>
            )}
            
            {/* Hover Actions (Show only on hover) */}
            <div className="absolute inset-0 rounded-[2.5rem] flex items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-20 bg-black/40 backdrop-blur-[2px] gap-4">
              {!isReadOnly && (
                <>
                  <button onClick={() => document.getElementById('avatar-upload').click()} className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl text-white transition-all transform hover:scale-110" title="Update Image">
                    <FiUpload className="w-5 h-5" />
                  </button>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateProfile({ profileImage: reader.result });
                        reader.readAsDataURL(file);
                      }
                    }} />
                </>
              )}
              {(profileData.avatar || profileData.profileImage) && (
                <button onClick={() => setIsViewingImage(true)} className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl text-white transition-all transform hover:scale-110" title="View Image">
                  <FiEye className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* User Info Header */}
          <div className="text-center w-full mb-8">
            <h3 className="text-3xl font-black text-white tracking-tight leading-tight">{profileData.name}</h3>
            <p className="text-primary font-bold tracking-wide mt-1 underline decoration-primary/30 underline-offset-4">@{profileData.username || profileData.name?.toLowerCase()}</p>
            <div className="flex justify-center mt-4">
              <span className="bg-primary text-primary-foreground text-[11px] font-black px-4 py-1.5 rounded-xl shadow-lg tracking-[0.1em] uppercase flex items-center gap-2 border border-white/10">
                <FiTag className="w-3.5 h-3.5" /> {profileData.customTitle || 'Member'}
              </span>
            </div>
          </div>

          <div className="w-full space-y-6 overflow-y-auto max-h-[40vh] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isReadOnly ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">About Me</label>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {profileData.bio || "Passionate about building great things with Nexuspace."}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {profileData.email && (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-all lg:hover:bg-white/[0.08]">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FiMail /></div>
                      <div className="flex-1 overflow-hidden">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Email</label>
                        <p className="text-slate-300 text-sm truncate">{profileData.email}</p>
                      </div>
                    </div>
                  )}
                  {profileData.phoneNumber && (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-all lg:hover:bg-white/[0.08]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><FiPhone /></div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          Phone {profileData.isPhoneVerified && <FiCheck className="text-emerald-400 w-3 h-3" />}
                        </label>
                        <p className="text-slate-300 text-sm">{profileData.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="group/input">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within/input:text-primary transition-colors">Display Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-primary" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium placeholder:text-slate-600 lg:hover:bg-white/[0.08] shadow-inner"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within/input:text-primary transition-colors">Profile Title</label>
                  <div className="relative">
                    <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-primary" />
                    <input 
                      type="text" 
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      maxLength={50}
                      placeholder="e.g. Designer, Developer..."
                      className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium placeholder:text-slate-600 lg:hover:bg-white/[0.08] shadow-inner"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within/input:text-primary transition-colors">Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe yourself..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium resize-none placeholder:text-slate-600 lg:hover:bg-white/[0.08] shadow-inner"
                  />
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within/input:text-primary transition-colors">
                    Phone Number {profileData.isPhoneVerified && <span className="text-emerald-400 normal-case ml-1 font-bold">(Verified)</span>}
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-primary" />
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (e.target.value !== profileData.phoneNumber) setIsOtpSent(false);
                        }}
                        placeholder="+1 234..."
                        className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium placeholder:text-slate-600 lg:hover:bg-white/[0.08] shadow-inner"
                      />
                    </div>
                    {!profileData.isPhoneVerified && phoneNumber && !isOtpSent && (
                      <button 
                        onClick={async () => {
                          const success = await sendPhoneOtp(phoneNumber);
                          if (success) setIsOtpSent(true);
                        }}
                        className="px-5 py-2 bg-primary text-white text-xs font-black rounded-2xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] uppercase tracking-widest"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isOtpSent && !profileData.isPhoneVerified && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-primary/5 rounded-2xl p-4 border border-primary/20"
                    >
                      <div className="group/input">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center">Security Verification Code</label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                            <input 
                              type="text" 
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full bg-black/40 border border-primary/30 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-[0.5em] text-center text-lg"
                            />
                          </div>
                          <button 
                            disabled={otp.length !== 6 || isVerifying}
                            onClick={async () => {
                              setIsVerifying(true);
                              const success = await verifyPhone(phoneNumber, otp);
                              if (success) {
                                setIsOtpSent(false);
                                setOtp('');
                              }
                              setIsVerifying(false);
                            }}
                            className="px-5 py-2 bg-emerald-600 disabled:bg-slate-700 text-white text-xs font-black rounded-xl hover:bg-emerald-500 transition-all shadow-lg uppercase tracking-widest"
                          >
                            {isVerifying ? '...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="w-full mt-8 flex items-center justify-between gap-4">
            {!isReadOnly ? (
              <>
                <button 
                  onClick={() => { logout(); onClose(); }}
                  className="px-5 py-3 text-xs font-black uppercase tracking-widest text-red-400 lg:hover:text-white lg:hover:bg-red-500 rounded-2xl transition-all"
                >
                  Sign Out
                </button>
                <div className="flex gap-3 flex-1">
                  <button 
                    onClick={onClose}
                    className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-400 lg:hover:text-white lg:hover:bg-white/5 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { updateProfile({ name, username, bio, customTitle }); onClose(); }}
                    className="flex-[1.5] py-3 text-xs font-black uppercase tracking-widest bg-white text-black rounded-2xl lg:hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiCheck className="w-4 h-4" /> Save
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full py-4" />
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isViewingImage && (profileData.avatar || profileData.profileImage) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsViewingImage(false)}
          >
            <button 
              onClick={() => setIsViewingImage(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={profileData.avatar || profileData.profileImage}
              alt="Profile Full Size"
              className="w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] object-cover rounded-full shadow-[0_0_100px_-20px_rgba(99,102,241,0.5)] border-4 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
