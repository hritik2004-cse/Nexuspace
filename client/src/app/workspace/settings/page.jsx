"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogOut, FiLayout, FiCheck, FiCamera, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile States
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customTitle, setCustomTitle] = useState(user?.customTitle || '');
  const [profileImage, setProfileImage] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ name, username, bio, customTitle, profileImage });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'password', label: 'Security', icon: <FiLock /> },
    { id: 'appearance', label: 'Appearance', icon: <FiLayout /> },
  ];

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-slate-900/30">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">User Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your account, security, and appearance</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-slate-800 p-4 space-y-2 overflow-y-auto bg-slate-950">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-800">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-8"
              >
                <div className="flex items-center gap-8 bg-slate-900/40 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-indigo-500/20 shadow-2xl transition-transform group-hover:scale-[1.02]">
                      <img 
                        src={profileImage || user?.avatar || user?.profileImage || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                      <FiCamera className="text-3xl text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{user?.name}</h3>
                    <p className="text-indigo-400 font-bold text-sm">@{user?.username}</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{user?.customTitle || 'Member'}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Display Name</label>
                      <input 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Username</label>
                      <input 
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                        placeholder="johndoe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Profile Title</label>
                    <input 
                      value={customTitle} 
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                      placeholder="Product Designer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Bio</label>
                    <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold placeholder:text-slate-700 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingProfile ? 'Saving...' : <><FiCheck /> Save Changes</>}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Change Password</h2>
                  <p className="text-slate-400 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                    <input 
                      type="password"
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">New Password</label>
                    <input 
                      type="password"
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Confirm New Password</label>
                    <input 
                      type="password"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">Interface Themes</h2>
                  <p className="text-slate-400 text-sm">Choose the perfect aesthetic for your workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentTheme(key)}
                      className={`relative group p-6 rounded-3xl border-2 transition-all text-left ${
                        currentTheme === key 
                          ? 'border-indigo-500 bg-indigo-500/5' 
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-white uppercase tracking-widest">{theme.name}</span>
                        {currentTheme === key && <FiCheck className="text-indigo-400 text-xl" />}
                      </div>
                      
                      {/* Theme Preview Cards */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.primaryHex }}></div>
                           <div className="flex-1 h-8 rounded-lg bg-slate-800 opacity-50"></div>
                        </div>
                        <div className="w-full h-12 rounded-lg bg-slate-800 opacity-30"></div>
                      </div>

                      {currentTheme === key && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg scale-110">
                          <FiCheck className="text-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
