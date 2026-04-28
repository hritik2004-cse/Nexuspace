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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/80 backdrop-blur-md">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex flex-col bg-[#0a0a0f]/90 border border-white/10 rounded-3xl shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)] w-full max-w-md max-h-[90vh] overflow-hidden backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Gradient Glow inside modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[60px] pointer-events-none"></div>

        <div className="flex shrink-0 justify-between items-center p-6 border-b border-white/5 relative z-10">
          <h2 className="text-xl font-black font-sans text-white tracking-tight">{isReadOnly ? `${profileData.name}'s Profile` : 'Profile Settings'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 lg:hover:text-white transition-colors p-2 rounded-xl lg:hover:bg-white/5"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-110 lg:group-hover:scale-125 transition-transform duration-500"></div>
              {(profileData.avatar || profileData.profileImage) ? (
                <img 
                  src={profileData.avatar || profileData.profileImage} 
                  alt="Profile" 
                  className="w-28 h-28 rounded-full object-cover shadow-2xl ring-4 ring-[#0a0a0f] relative z-10 lg:hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-4 ring-[#0a0a0f] relative z-10 lg:hover:scale-105 transition-transform">
                  {profileData.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {profileData.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 border-4 border-[#0a0a0f] rounded-full z-20 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
              )}
              
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm gap-3">
                {!isReadOnly && (
                  <>
                    <button onClick={() => document.getElementById('avatar-upload').click()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white hover:text-indigo-300 transition-colors" title="Update Image">
                      <FiUpload className="w-4 h-4" />
                    </button>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateProfile({ profileImage: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </>
                )}
                {(profileData.avatar || profileData.profileImage) && (
                  <button onClick={() => setIsViewingImage(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white hover:text-indigo-300 transition-colors" title="View Image">
                    <FiEye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {isReadOnly ? (
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">{profileData.name}</h3>
                <p className="text-indigo-400 font-medium">@{profileData.username || profileData.name?.toLowerCase()}</p>
                <div className="flex justify-center mt-2">
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase flex items-center gap-1.5 border border-indigo-500/30">
                    <FiTag className="w-3 h-3" /> {profileData.customTitle || 'Member'}
                  </span>
                </div>
                {profileData.bio && <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-sm mx-auto">{profileData.bio}</p>}
                <div className="flex flex-col gap-2 mt-4 items-center">
                  {profileData.email && <p className="text-slate-500 text-sm items-center justify-center gap-2 bg-white/5 py-2 px-4 rounded-xl inline-flex w-fit"><FiMail className="w-4 h-4"/> {profileData.email}</p>}
                  {profileData.phoneNumber && (
                    <p className="text-slate-500 text-sm items-center justify-center gap-2 bg-white/5 py-2 px-4 rounded-xl inline-flex w-fit">
                      <FiPhone className="w-4 h-4"/> {profileData.phoneNumber}
                      {profileData.isPhoneVerified && <FiCheck className="text-emerald-400 w-3 h-3" />}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="group/input">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within/input:text-indigo-400 transition-colors">Display Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-indigo-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/2 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-slate-600 hover:bg-white/4"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within/input:text-indigo-400 transition-colors">Profile Title</label>
              <div className="relative">
                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-indigo-400" />
                <input 
                  type="text" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Member, Developer, Designer..."
                  className="w-full bg-white/2 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-slate-600 hover:bg-white/4"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within/input:text-indigo-400 transition-colors">Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500 text-sm font-black transition-colors group-focus-within/input:text-indigo-400">@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full bg-white/2 border border-white/10 text-white rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-slate-600 hover:bg-white/4"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within/input:text-indigo-400 transition-colors">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={2}
                className="w-full bg-white/2 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans resize-none placeholder:text-slate-600 hover:bg-white/4"
              />
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within/input:text-indigo-400 transition-colors">
                Phone Number {profileData.isPhoneVerified && <span className="text-emerald-400 normal-case ml-1 font-medium">(Verified)</span>}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within/input:text-indigo-400" />
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (e.target.value !== profileData.phoneNumber) setIsOtpSent(false);
                    }}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-white/2 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-slate-600 hover:bg-white/4"
                  />
                </div>
                {!profileData.isPhoneVerified && phoneNumber && !isOtpSent && (
                  <button 
                    onClick={async () => {
                      const success = await sendPhoneOtp(phoneNumber);
                      if (success) setIsOtpSent(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg"
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
                  className="overflow-hidden"
                >
                  <div className="group/input pt-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Enter 6-digit OTP</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4" />
                        <input 
                          type="text" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full bg-indigo-500/5 border border-indigo-500/30 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono tracking-[0.5em] text-center"
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
                        className="px-4 py-2 bg-emerald-600 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        {isVerifying ? '...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-black/20 border border-white/5 text-slate-500 rounded-xl pl-11 pr-4 py-3 cursor-not-allowed font-sans"
                />
              </div>
            </div>
              </>
            )}
          </div>

          {!isReadOnly ? (
            <div className="pt-6 flex shrink-0 items-center justify-between border-t border-white/5 mt-6">
              <button 
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-4 py-2.5 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all"
              >
                Log out
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    updateProfile({ name, username, bio, customTitle });
                    onClose();
                  }}
                  className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-slate-200 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-6 flex shrink-0 items-center justify-center border-t border-white/5 mt-6">
              <button 
                onClick={onClose}
                className="w-full py-3 text-sm font-bold bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          )}
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
