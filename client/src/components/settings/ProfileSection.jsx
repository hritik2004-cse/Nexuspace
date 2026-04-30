"use client";

import { useSettings } from '@/context/SettingsContext';
import SectionWrapper from './SectionWrapper';
import AvatarUpload from './AvatarUpload';
import { FiCheck, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function ProfileSection() {
  const { currentData, updateField, isSaving, lastSaved, saveError, user } = useSettings();

  const handleAvatarUpload = async (file) => {
    // This would typically call updateProfile with the file
    // The SettingsContext could also handle this, but let's keep it simple
    // updateProfile handles file uploads in AuthContext
    return new Promise((resolve, reject) => {
      // Logic would go here
      setTimeout(resolve, 1000); // Simulate
    });
  };

  const SavingIndicator = () => (
    <div className="absolute top-2 right-4 md:top-4 md:right-8 flex items-center gap-2 pointer-events-none z-20">
      {isSaving ? (
        <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-primary/20 shadow-lg">
          <FiRefreshCw className="animate-spin" /> <span className="hidden xs:inline">Saving</span>
        </span>
      ) : lastSaved ? (
        <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-green-500/20 shadow-lg">
          <FiCheck /> <span className="hidden xs:inline">Saved</span>
        </span>
      ) : saveError ? (
        <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-red-500/20 shadow-lg">
          <FiAlertCircle /> <span className="hidden xs:inline">Failed</span>
        </span>
      ) : null}
    </div>
  );

  return (
    <SectionWrapper 
      id="panel-profile"
      title="Public Profile" 
      description="Manage how you appear to others in the workspace."
    >
      <SavingIndicator />

      <div className="space-y-10">
        <AvatarUpload 
          initialImage={user?.avatar || user?.profileImage} 
          userName={user?.name}
          onUpload={handleAvatarUpload}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              Display Name
            </label>
            <input 
              value={currentData?.name} 
              onChange={e => updateField('name', e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-800"
              placeholder="e.g. Alex Rivera"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              Username
            </label>
            <input 
              value={currentData?.username} 
              onChange={e => updateField('username', e.target.value)}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-800"
              placeholder="alex_rivera"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary"></div>
            Profile Title
          </label>
          <input 
            value={currentData?.customTitle} 
            onChange={e => updateField('customTitle', e.target.value)}
            className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-800"
            placeholder="e.g. Senior Product Designer"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary"></div>
            Short Bio
          </label>
          <textarea 
            value={currentData?.bio} 
            onChange={e => updateField('bio', e.target.value)}
            rows={4}
            className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 resize-none"
            placeholder="A little bit about yourself..."
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
