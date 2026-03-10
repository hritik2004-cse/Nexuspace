"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiX, FiCheck, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ProfileModal({ isOpen, onClose, viewUser = null }) {
  const { user, logout, updateProfile } = useAuth();
  
  // If viewUser is provided, use their data, otherwise use the logged-in user's data
  const profileData = viewUser || user || {};
  const isReadOnly = !!viewUser;

  const [name, setName] = useState(profileData.name || '');
  const [username, setUsername] = useState(profileData.username || profileData.name?.toLowerCase() || '');
  const [bio, setBio] = useState(profileData.bio || '');
  const [email, setEmail] = useState(profileData.email || '');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold font-sans text-white">{isReadOnly ? `${profileData.name}'s Profile` : 'Profile Settings'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-center justify-center mb-6">
            <div className={`relative ${!isReadOnly ? 'group cursor-pointer' : ''}`} onClick={() => !isReadOnly && document.getElementById('avatar-upload').click()}>
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-slate-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-slate-900">
                  {profileData.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {profileData.isOnline && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full"></div>
              )}
              {!isReadOnly && (
                <>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">Upload Image</span>
                  </div>
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
            </div>
          </div>

          <div className="space-y-4">
            {isReadOnly ? (
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">{profileData.name}</h3>
                <p className="text-indigo-400 font-medium">@{profileData.username || profileData.name?.toLowerCase()}</p>
                {profileData.bio && <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-sm mx-auto">{profileData.bio}</p>}
                {profileData.email && <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-2"><FiMail className="w-4 h-4"/> {profileData.email}</p>}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-500 text-sm font-bold">@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={2}
                className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-slate-800/30 border border-slate-800 text-slate-400 rounded-lg pl-10 pr-4 py-2 cursor-not-allowed font-sans"
                />
              </div>
            </div>
              </>
            )}
          </div>

          {!isReadOnly ? (
            <div className="pt-4 flex shrink-0 items-center justify-between border-t border-slate-800">
              <button 
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
              >
                Log out
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    updateProfile({ name, username, bio });
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex shrink-0 items-center justify-end border-t border-slate-800">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
